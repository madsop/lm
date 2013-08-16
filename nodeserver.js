var express = require('express'),
	faye = require('faye'),
	readline = require('readline'),
	fs = require('fs');


var bayeux = new faye.NodeAdapter({mount: '/faye*', timeout: 45});

var app = express();


app.all('/*', function(req, res, next) {
//  console.log(res);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Pragma, Content-Type");
  next();
 });

app.configure(function(){
//  app.set('views', __dirname + '/views');
//  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(bayeux);
/*  app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    console.log(req);
    return next();
  }); */
 // app.use(express.static(__dirname + '/client_dependencies'));
//  app.use(express.static(__dirname + '/public'));
//  app.use(express.static(__dirname + '/lib'));
});
 
// bayeux.setHeader('Access-Control-Allow-Origin', '*');

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

var writeFile = function (filename, data) {
	fs.writeFile(filename, data, function (err) {
		if (err) throw err;
		console.log('Lagra fil ' +filename + ' med ' + data);
	});
}

var timestampCounter = 0;
var nesteTalar = function (data){
	var timestamp = data.timestamp;
	timestampCounter = timestamp+1;
	writeFile('timestamp.txt', timestampCounter);
	return timestampCounter;
}
var stryk = function (innlegg) {
	if (innlegg <= timestampCounter) { return; } 
	// les fra array over tekstfil, finn timestamp, slett linje. kontrollsjekk om timestamp > noverande talar
	var lagraInnlegg = [];

	var rd = readline.createInterface({
		input: fs.createReadStream('testles.txt'),
		output: process.stdout,
		terminal: false
	});
	rd.on('line', function (line) {
		var timestamp = line.split('"timestamp": ')[1].slice(0,-2); // pokker, så hack
		if (parseInt(timestamp) !== parseInt(innlegg.innlegg.id)) {
			lagraInnlegg.push(line + "\n");
		}
	writeFile('testles2.txt', lagraInnlegg);
	});

}

bayeux.bind('publish', function(clientId, channel, data) {
	switch (channel) {
		case '/nesteTalar':
			nesteTalar(data);
			break;
		case '/stryk':
			stryk(data);
			break;
	}
	console.log(clientId + ' . ' + channel + ' . ' + data.speaker);
});

app.get('/lm/taleliste', function (request, response) {
/*	var stream = fs.createReadStream('testles.txt');i
	console.log(stream);
	stream.on('line', function(line) { 
		console.log(line); 
	});
*/
//	fs.readFile('testles.txt', 'utf8', function (err, data) { console.log(data); });
	fs.readFile('testles.txt', function(err, f){
	    var array = f.toString().trim().split('\n');
//            console.log(array);
	    // use the array
//	console.log(request.query);

	response.jsonp({'response': array, 'lastSpeaker': 0});
	 });
});
bayeux.attach(app);
app.listen(128, 'localhost');
console.log("Express server listening in %s mode", app.settings.env);
