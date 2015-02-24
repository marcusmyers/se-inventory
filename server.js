var http         = require('http');
var os           = require('os');
var jf           = require('jsonfile');
var express      = require('express');
var serialNumber = require('serial-number');
var app          = express();
var fs           = require('fs');
var io           = require('socket.io-client');
var bodyparser   = require('body-parser');
var numeral      = require('numeral');
var conffile     = './config/agent.json';
var datafile     = './data/db.json';

// Read in config file
var config = jf.readFileSync(conffile);
// Read Data file
var db = jf.readFileSync(datafile);

function getIPAddress() {
  var interfaces = require('os').networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];

    if(!/(loopback|vmware|internal|vboxnet|lo|awdl)/gi.test(devName)){
      for (var i = 0; i < iface.length; i++) {
        var alias = iface[i];
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
          return alias.address;
      }
    }
  }

  return '0.0.0.0';
}

// Set Serial
var sn;
serialNumber(function (err, value) {
  sn = value;
});

db.laptop = config.laptop;

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

// IF ip address is not set
// set it
if (db.ip == ""){
  db.ip = getIPAddress();
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

// If Serial is not set, set it using
// serial from config file
if(db.serial ==""){
  db.serial = config.serial;
}

// If building is not set, set it using
// building from config file
if(db.location.building ==""){
  db.location.building = config.location.building;
}

// If room is not set, set it using
// room from config file
if(db.location.room ==""){
  db.location.room = config.location.room;
}

// Write data to the db.json for inventory
jf.writeFileSync('./data/db.json', db);
// Write data to the config.json for inventory
jf.writeFileSync('./config/agent.json', config);

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

// Returns a json representation of the clients
// inventory data
router.get('/inventory', function(req, res) {
  res.json(db)
});

// Edit inventory data
router.post( '/edit', bodyparser.json(), function(req, res, next){
  db.tag = req.param('tag');
  db.serial = req.param('serial');
  db.location.building = req.param('building');
  db.location.room = req.param('room');
  db.po = req.param('po');
  db.cost = numeral().unformat(req.param('cost')).format('0.00');
  db.ip = req.param('ip');
  jf.writeFileSync('./data/db.json', db);
  res.redirect('/');
});

// more routes for our API will happen here


// END ROUTES FOR OUR API
// =============================================================================


// Basic route (accessed at GET http://localhost:3737/)
// Just shows the current inventory of the device
app.get('/', function(req, res) {
  res.render('index', { data : db })
});

app.get('/edit', function(req, res){
  res.render('edit', { data : db });
});

app.post('/edit', bodyparser.urlencoded({'extended':'true'}), function(req, res){
  db.tag = req.body.tag;
  db.serial = req.body.serial;
  db.location.building = req.body.building;
  db.location.room = req.body.room;
  db.po = req.body.po;
  db.cost = numeral().unformat(req.param('cost')).format('0.00');
  jf.writeFileSync('./data/db.json', db);
  res.redirect('/');
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

var server = app.listen(config.port, function () {

  var host = server.address().address
  var port = server.address().port

  var socket = io(config.server);
  socket.emit('inv-message', db);
  fs.watchFile(datafile, function(){
    socket.emit('inv-message', db);
  });
  console.log('Example app listening at http://%s:%s', host, port)

});
