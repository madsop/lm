var http = require('http'),
    response = JSON.stringify([{'title':'Wire the money to Panama','isDone':true},{'title':'Get hair dye, beard trimmer, dark glasses and passport','isDone':false},{'title':'Book taxi to airport','isDone':false},{'title':'Arrange for someone to look after the cat','isDone':false}]);

// do not EVER use the death* for allow origin for real
// It's just used here to avoid having to run the index of a local fileserver
http.createServer(function (req, res) {
    if (req.method === "GET") {
        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(response);
    } else {
         res.writeHead(201, {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*'
        });
        res.end("POST OK, but server is stupid and does not save");
    }
}).listen(1337, '127.0.0.1');
