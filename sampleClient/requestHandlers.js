var querystring = require("querystring"),
    fs = require("fs"),
    formidable = require("formidable"),
    utils = require("util"),
    iTraffAPI = require("recognize.im");
   

iTraffAPI.setCredentials(1, '', '');

function start(response) {
  console.log("Request handler 'start' was called.");

  var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" '+
    'content="text/html; charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    '<form action="/recognize" enctype="multipart/form-data" '+
    'method="post">'+
    '<input type="file" name="upload" multiple="multiple">'+
    '<label>Show all results<input type="checkbox" name="getAll"></label>'+
    '<label>Multi mode<input type="checkbox" name="multi"></label>'+
    '<input type="submit" value="Recognize" />'+
    '</form>'+
    '<br/>' +
    
    '<form action="/imageInsert" enctype="multipart/form-data" '+
    'method="post">'+
    '<input type="text" name="id">'+
    '<input type="text" name="name">'+
    '<input type="file" name="upload" multiple="multiple">'+
    '<input type="submit" value="Add image" />'+
    '</form>'+
    '<br/><a href="/build">Build index</a>' +
    '<br/><a href="/list">Image list</a>' +
    '</body>'+
    '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

function recognize(response, request) {
  console.log("Request handler 'upload' was called.");

  var form = new formidable.IncomingForm();
  console.log("about to parse");
  form.parse(request, function(error, fields, files) {
    console.log("parsing done");
    fs.readFile(files.upload.path, "binary", function(error, data) {
      if(error) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(error + "\n");
        response.end();
      } else {
        iTraffAPI.recognize(data, function(obj, error){
            if(error) {
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.write(error + "\n");
                response.end();
            } else {
                response.writeHead(200, {"Content-Type": "text/html"});
				response.write("<html><head></head><body>");
				if (obj.status == 0) {
					response.write("<p>Recognized objects: " + obj.objects.length + "</p>");
					response.write("<p><ul>");
					for (var o in obj.objects) {
						response.write("<li>" + o.name + "</li>");
					}
					response.write("</ul></p>");
				} else {
					response.write(obj.message);
				}
				response.write("</body></html>");
                response.end();
            }
        }, fields.multi, fields.getAll);
      }
    });
  });
}

function imageInsert(response, request) {
  console.log("Request handler 'imageInsert' was called.");

  var form = new formidable.IncomingForm();
  console.log("about to parse");
  form.parse(request, function(error, fields, files) {
    console.log("parsing done");

    fs.readFile(files.upload.path, "binary", function(error, file) {
      if(error) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(error + "\n");
        response.end();
      } else {
        iTraffAPI.on("error", function(msg){
          response.writeHead(500, {"Content-Type": "text/html"});
          response.write(msg);
          response.end();
        });

        iTraffAPI.on('success', function(data) {
              response.writeHead(200, {"Content-Type": "text/html"});
              var utils = require('util');
              response.write("Image uploaded!");
              response.end();
        });
        console.log("Calling imageInsert");
        iTraffAPI.imageInsert(fields.id, fields.name, file);
      }
    });
  });
}

function status(response) {
  console.log("Request handler 'auth' was called.");
  iTraffAPI.on("error", function(msg){
    response.writeHead(500, {"Content-Type": "text/html"});
    response.write(msg);
    response.end();
  });

  iTraffAPI.on('success', function(data) {
        response.writeHead(200, {"Content-Type": "text/html"});
        var utils = require('util');
        response.write(utils.inspect(data));
        response.end();
  });
  iTraffAPI.indexStatus();
}

function list(response) {
  console.log("Request handler 'list' was called.");
  iTraffAPI.on("error", function(msg){
    response.writeHead(500, {"Content-Type": "text/html"});
    response.write(msg);
    response.end();
  });

  iTraffAPI.on('success', function(data) {
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write('<table><tr><th>ID</th><th>Name</th><th>Image</th></tr>');
        for(var i in data) {
          var img = data[i];
          response.write('<tr><td>' + img.id + '</td>');
          response.write('<td>' + img.name + '</td>');
          response.write('<td><img src="'+ img.href + '?w=100&h=100"/></td><tr>');
        }
        response.write('</table>');
        //response.write(utils.inspect(data));
        response.end();
  });
  iTraffAPI.imageList();
}

function build(response) {
  console.log("Request handler 'auth' was called.");
  iTraffAPI.on("error", function(msg){
    response.writeHead(500, {"Content-Type": "text/html"});
    response.write(msg);
    response.end();
  });

  iTraffAPI.on('success', function(data) {
        response.writeHead(200, {"Content-Type": "text/html"});
        var utils = require('util');
        response.write(utils.inspect(data));
        response.write('<a href="/status">Status</a>');
        response.end();
  });
  iTraffAPI.indexBuild();
}

exports.start = start;
exports.recognize = recognize;
exports.status = status;
exports.list = list;
exports.build = build;
exports.insert = imageInsert;
