var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

function templateHTML(title, list, body, controll){
    return `
    <!doctype html>
            <html>
            <head>
              <title>WEB1 - ${title}</title>
              <meta charset="utf-8">
            </head>
            <body>
              <h1><a href="/">WEB</a></h1>
              ${list}
              ${controll}
              ${body}
            </body>
            </html>
    `
}
function templateList(fileList){
    var list = '<ul>';
    var i = 0;
    while (i < fileList.length){
        list = list + `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`
        i = i + 1;
    }
    list = list + '</ul>';
    return list;
}


var app = http.createServer(function (request, response) {
    var _url = request.url;
    var queryData = new URL('http://localhost:3000' + _url).searchParams;
    var pathname = new URL('http://localhost:3000' + _url).pathname;
    if(pathname === '/'){
        if(queryData.get('id') === undefined || queryData.get('id') === null){
            fs.readdir('./data', function (error, fileList){
                var title = 'Welcome'
                var description = 'Hello Node.js'
                var list = templateList(fileList);
                var template = templateHTML(title, list, `<h2>${title}</h2><p>${description}</p>`,` <a href="/create">create</a>`);
                response.writeHead(200)
                response.end(template);
            });
        }else{
            fs.readdir('./data', function (error, fileList){
                fs.readFile(`data/${queryData.get('id')}`,'utf-8',function (err,description){
                    var title = queryData.get('id')
                    var list = templateList(fileList);
                    var template = templateHTML(title, list, `<h2>${title}</h2><p>${description}</p>`,` <a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
                    response.writeHead(200)
                    response.end(template);
                })
            });
        }
    }else if (pathname == '/create'){
        fs.readdir('./data', function (error, fileList){
            var title = 'WEB - create'
            var list = templateList(fileList);
            var template = templateHTML(title, list, `
                <form action="http://localhost:3000/creat_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
            `, '');
            response.writeHead(200)
            response.end(template);
        });
    }else if (pathname == '/creat_process'){
        var body = '';
        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            var title = post.title
            var description = post.description
            fs.writeFile(`data/${title}`,description, 'utf-8', function (err){
                response.writeHead(302, {Location:`/?id=${title}`})
                response.end();
            })
        });
    }else{
        response.writeHead(404)
        response.end('Not Found');
    }

});
app.listen(3000);