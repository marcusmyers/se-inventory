var http = require('http');
var os   = require('os');
var jf   = require('jsonfile');
var express = require('express');
var app  = express();

var file = './config/agent.json'

// Read in config file
var config = jf.readFileSync(file);

var db = jf.readFileSync('./data/db.json');

// Set Serial
db.serial = config.serial;

// IF inventory tag is not set, set it using
// tag from the config file
if (db.tag == ""){
  db.tag = config.tag;
}

// IF hostname is not set, set it using
// os.hostname()
if (db.hostname == ""){
  db.hostname = os.hostname();
}

// IF memory is not set, set it using
// os.totalmem()
if (db.memory == ""){
  db.memory = ((os.totalmem()/1024)/1024)/1024 + "GB";
}

// IF CPU is not set, set it using
// os.totalmem()
if (db.cpu == ""){
  db.cpu = os.cpus()[0].model;
}

// IF CPU is not set, set it using
// os.totalmem()
if (db.os_version == ""){
  switch(os.type()){
    case "Darwin":
      db.os_version = "Mac OS X";
      break;
    case "Windows_NT":
      db.os_version = "Microsoft Windows";
      break;
    default:
      db.os_version = "Mac OS X";
  }

}

// Write data to the db.json for inventory
jf.writeFileSync('./data/db.json', db);

// Set views folder
app.set('views', __dirname + '/views');
// Set template engine
app.set('view engine', 'jade');
// Set directory to serve from.
// Used more for css, js, images
app.use(express.static(__dirname + '/public'));

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:3737/)
// Just shows the current inventory of the device
router.get('/', function(req, res) {
  res.render('index', { data : db })
});

// Returns a json representation of the clients
// inventory data
router.get('/inventory', function(req, res) {
  res.json(db)
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use(router);

var server = app.listen(config.port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})

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
