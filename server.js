var http = require('http');
var os   = require('os');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');

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