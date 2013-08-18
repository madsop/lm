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
	writeFile(tekstfilNamn, JSON.stringify(heileTalelista));
}
var stryk = function (innleggId) {
//	if (innleggId <= timestampCounter) { return; } 
	var skalFjernes = _.find(heileTalelista, function (element) { 
		console.log("timestamp: " +element.timestamp +", id som skal finnast: " +innleggId);
		return element.timestamp == innleggId; });
	heileTalelista = _.without(heileTalelista, skalFjernes);
	lagreTaleliste();
}

var lesInnTaleliste = function () {
	heileTalelista = JSON.parse(fs.readFileSync(tekstfilNamn));
}

bayeux.bind('publish', function(clientId, channel, data) {
	switch (channel) {
		case '/nesteTalar':
			nesteTalar(data);
			break;
		case '/stryk':
			console.log('mottatt, innlegg: ' +data.innlegg);
			stryk(data.innlegg);
			break;
	}
//	consolelog(clientId + ' . ' + channel + ' . ' + data.speaker);
});

app.get('/lm/taleliste', function (request, response) {
	lesInnTaleliste();
	response.jsonp({'response': heileTalelista, 'lastSpeaker': 0});
});
bayeux.attach(app);
app.listen(128, 'localhost');
console.log("Express server listening in %s mode", app.settings.env);
