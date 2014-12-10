var http = require('http');
var os   = require('os');
var fs   = require('fs');
var jf   = require('jsonfile');

var file = './config/agent.json'
var config = jf.readFileSync(file);

var db = jf.readFileSync('./data/db.json');

db.tag = config.tag;

console.log(db);

jf.writeFileSync('./data/db.json', db);


http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(JSON.stringify(db));
}).listen(config.port, '127.0.0.1');
console.log('Server running at http://127.0.0.1:'+config.port+'/');
/*
console.log('tmp dir: ', os.tmpdir());
console.log('hostname: ', os.hostname());
console.log('type: ', os.type());
console.log('platform: ', os.platform());
console.log('arch:', os.arch());
console.log('release:', os.release());
console.log('uptime:', (os.uptime()/60));
console.log('load avg:', os.loadavg());
console.log('total memory:', os.totalmem());
console.log('free memory:', os.freemem());
console.log('network interfaces:', os.networkInterfaces());
*/
