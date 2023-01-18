var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js')
var path = require('path');
const sanitizeHtml = require('sanitize-html');

var app = http.createServer(function (request, response) {
    var _url = request.url;
    var queryData = new URL('http://localhost:3000' + _url).searchParams;
    var pathname = new URL('http://localhost:3000' + _url).pathname;
    if(pathname === '/'){
        if(queryData.get('id') === undefined || queryData.get('id') === null){
            fs.readdir('./data', function (error, fileList){
                var title = 'Welcome'
                var description = 'Hello Node.js'
                var list = template.list(fileList);
                var html = template.html(title, list, `<h2>${title}</h2><p>${description}</p>`,` <a href="/create">create</a>`);
                response.writeHead(200)
                response.end(html);
            });
        }else{
            fs.readdir('./data', function (error, fileList){
                var filteredId = path.parse(queryData.get('id')).base
                fs.readFile(`data/${filteredId}`,'utf-8',function (err,description){
                    var title = queryData.get('id')
                    var sanitizeTitle = sanitizeHtml(title)
                    var sanitizeDescription = sanitizeHtml(description, {
                        allowedTags: ['h1']
                    })
                    var list = template.list(fileList);
                    var html = template.html(title, list, `<h2>${sanitizeTitle}</h2><p>${sanitizeDescription}</p>`,
                        ` <a href="/create">create</a> <a href="/update?id=${sanitizeTitle}">update</a> 
                                <form action="delete_process" method="post">
                                    <input type="hidden" name="id" value="${sanitizeTitle}">
                                    <input type="submit" value="delete">
                                </form>
                                `);
                    response.writeHead(200)
                    response.end(html);
                })
            });
        }
    }else if (pathname == '/create'){
        fs.readdir('./data', function (error, fileList){
            var title = 'WEB - create'
            var list = template.list(fileList);
            var html = template.html(title, list, `
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
            response.end(html);
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
            var sanitizeTitle = sanitizeHtml(title)
            var sanitizeDescription = sanitizeHtml(description)
            fs.writeFile(`data/${sanitizeTitle}`,sanitizeDescription, 'utf-8', function (err){
                response.writeHead(302, {Location:`/?id=${sanitizeTitle}`})
                response.end();
            })
        });
    }else if (pathname == '/update'){
        fs.readdir('./data', function (error, fileList){
            var filteredId = path.parse(queryData.get('id')).base
            fs.readFile(`data/${filteredId}`,'utf-8',function (err,description){
                var title = queryData.get('id')
                var sanitizeTitle = sanitizeHtml(title)
                var sanitizeDescription = sanitizeHtml(description)
                var list = template.list(fileList);
                var html = template.html(title, list, `
                <form action="http://localhost:3000/update_process" method="post">
                    <input type="hidden" name="id" value="${sanitizeTitle}">
                    <p><input type="text" name="title" placeholder="title" value="${sanitizeTitle}" ></p>
                    <p>
                        <textarea name="description" placeholder="description">${sanitizeDescription}</textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
                `,` <a href="/create">create</a> <a href="/update?id=${sanitizeTitle}">update</a>`);
                response.writeHead(200)
                response.end(html);
            })
        });
    }else if(pathname == '/update_process'){
        var body = '';
        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            var id = post.id
            var title = post.title
            var description = post.description
            var filteredId = path.parse(id).base
            fs.rename(`data/${filteredId}`,`data/${title}`,function (err){
                fs.writeFile(`data/${title}`,description, 'utf-8', function (err){
                    response.writeHead(302, {Location:`/?id=${title}`})
                    response.end();
                })
            })
        });
    }else if(pathname == '/delete_process'){
        var body = '';
        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            var id = post.id
            var filteredId = path.parse(id).base
            fs.unlink(`data/${filteredId}`, function (err){
                response.writeHead(302, {Location:`/`})
                response.end()
            })
        });
    }else{
        response.writeHead(404)
        response.end('Not Found');
    }

});
app.listen(3000);