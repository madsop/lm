var express = require('express'),
	faye = require('faye'),
	readline = require('readline'),
	fs = require('fs'),
	_ = require('underscore');

var bayeux = new faye.NodeAdapter({mount: '/faye*', timeout: 45});

var app = express();

var tekstfilNamn = 'testles.txt';

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

// SETUP FERDIG HER

var heileTalelista = [];

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
var lagreTaleliste = function () {
	writeFile(tekstfilNamn, heileTalelista);
}
var stryk = function (innleggId) {
	if (innleggId <= timestampCounter) { return; } 
	// les fra array over tekstfil, finn timestamp, slett linje. kontrollsjekk om timestamp > noverande talar
	var skalFjernes = _.find(heileTalelista, function (element) { 
		console.log("timestamp: " +element.timestamp +", id som skal finnast: " +innleggId);
		return element.timestamp == innleggId; });
	console.log(skalFjernes);
	heileTalelista = _.without(heileTalelista, skalFjernes);
	_.each(heileTalelista, function (elem) { console.log(elem); });
	lagreTaleliste();
}

var lesInnTaleliste = function () {
	var tempInnlese = fs.readFileSync(tekstfilNamn).toString().split('\n');
	_.each(tempInnlese, function (element) {
		if (element.length === 0) { return; }
		heileTalelista.push(JSON.parse(element));
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
//	consolelog(clientId + ' . ' + channel + ' . ' + data.speaker);
});

app.get('/lm/taleliste', function (request, response) {
	fs.readFile(tekstfilNamn, function(err, f){
		var array = f.toString().trim().split('\n');
		response.jsonp({'response': array, 'lastSpeaker': 0});
	 });
	lesInnTaleliste();
});
bayeux.attach(app);
app.listen(128, 'localhost');
console.log("Express server listening in %s mode", app.settings.env);
