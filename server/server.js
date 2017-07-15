
var PORT = 34228;

/**
 * Created by josh on 1/26/17.
 */
var http = require('http');
var URL = require('url');
var ParserService = require("../src/ParserService");

var server = http.createServer((req,res) =>{
    try {
        console.log(req.method, req.url);

        var url = URL.parse(req.url,true);
        console.log("processing", url);

        if (!url.query || !url.query.text) return missingText(res);

        var action = ParserService.parse(url.query.text);
        if (action === false) {
            action = {
                action: "passthrough"
            }
        }
        action.originalText = url.query.text;
        var str = JSON.stringify(action, null, 5);
        console.log("sending back", str);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/json');
        res.write(str);
        res.end();
    } catch (e) {
        console.log(e);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/json');
        var str = JSON.stringify({action:'error', message:"an error occured with the command parser"}, null, 5);
        res.write(str);
        res.end();
    }

});

server.on('clientError', (err, socket)=>{
    console.log(err);
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(PORT, () => console.log(`server is running on port ${PORT}`));


function missingText(res) {
    res.statusCode = 500;
    res.setHeader('Content-Type','text/json');
    res.write(JSON.stringify({action:'error',message:"You must specify a 'text' parameter"},null,5));
    res.end();
}

function parseQuery(url) {
    var q = {};
    url.query.split("&").forEach((kvs)=>{
        var kv = kvs.split('=');
        q[kv[0]] = kv[1].replace(/%20/g,' ');
    });
    return q;
}
