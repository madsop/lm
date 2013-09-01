var express = require('express'),
	faye = require('faye'),
	readline = require('readline'),
	fs = require('fs'),
	_ = require('lodash');

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
//	timestampCounter = data.timestamp+1;
	timestampCounter += 1;
	writeFile('timestamp.txt', timestampCounter);
	return timestampCounter;
}
var lagreTaleliste = function () {
	writeFile(tekstfilNamn, JSON.stringify(heileTalelista));
}
var stryk = function (innleggId) {
//	if (innleggId <= timestampCounter) { return; } 
	var skalFjernes = _.find(heileTalelista, function (element) { 
//		console.log("timestamp: " +element.id +", id som skal finnast: " +innleggId);
		return element.id == innleggId; });
	heileTalelista = _.without(heileTalelista, skalFjernes);
	lagreTaleliste();
}

var lesInnTaleliste = function () {
	heileTalelista = JSON.parse(fs.readFileSync(tekstfilNamn));
}

var nyttInnlegg = function (innlegg) {
//	innlegg.id = heileTalelista.length;
	innlegg.id = nyInnleggsId();
	heileTalelista.push(innlegg);
	client = bayeux.getClient();
	client.publish('/nyttInnleggId', {id: innlegg.id});
	lagreTaleliste();
}

var nyInnleggsId = function () {
	var maksId = _.max(_.map(heileTalelista, function (element) { return element.id; }));
	if (maksId < 0) { return 0 };
	return maksId + 1;
}

var nyReplikk = function (replikk) {
	console.log("replikk, timestampCounter: " +timestampCounter +". first: " + heileTalelista[timestampCounter]);
	if (heileTalelista[timestampCounter-1] !== undefined && heileTalelista[timestampCounter-1].type === "Svarreplikk") { return; }
	var count = timestampCounter;
	var itemInList = heileTalelista[count];
	while (itemInList != null && ( itemInList.type !== "Innlegg" && itemInList.type !== "Svarreplikk" ) ) {
		count++;
		itemInList = heileTalelista[count];
	}
	
	//svarreplikk
	if (!(_.find(heileTalelista, function (obj) { return obj.type === "Svarreplikk";}))) {
		var originalInnlegget  = _.find(heileTalelista, function (element) { return element.type=='Innlegg';});
		var svarreplikk = {type:'Svarreplikk', speaker: originalInnlegget.speaker, id: maksId()+1};
		console.log("id: " + svarreplikk.id); 
		heileTalelista.splice(count,0, svarreplikk);
		client.publish('/nyttInnleggId', {id: svarreplikk.id});
	}

	// legg til innlegg i liste
	replikk.id = nyInnleggsId();
	heileTalelista.splice(count,0,replikk);
	client.publish('/nyttInnleggId', {id: replikk.id});
	lagreTaleliste();
}

var flyttOpp = function (innlegg) {
	var object = _.find(heileTalelista, function (element) { return innlegg.id == element.id; });
	var index = _.indexOf(heileTalelista, object);
	heileTalelista[index] = heileTalelista[index-1];
	heileTalelista[index-1] = object;
	lagreTaleliste();
}

var flyttNed = function (innlegg) {
	var object = _.find(heileTalelista, function (element) { return innlegg.id == element.id; }); var index = _.indexOf(heileTalelista, object);
	heileTalelista[index] = heileTalelista[index+1];
	heileTalelista[index+1] = object;
	lagreTaleliste();
}

client = bayeux.getClient();
var tilDagsorden = function (innlegg) {
	innlegg.id = heileTalelista.length;
	if (_.first(heileTalelista).type !== "Til dagsorden") {
		heileTalelista.unshift(innlegg);
	}
	else {
		var indexToPutObject = _.find(heileTalelista, function (element) { return element.type !== "Til dagsorden"; });
		heileTalelista.splice(_.indexOf(heileTalelista, indexToPutObject), 0, innlegg);
	}
	client.publish('/nyttInnleggId', {id: innlegg.id});
	lagreTaleliste();
}

bayeux.bind('publish', function(clientId, channel, data) {
	switch (channel) {
		case '/nesteTalar':
			nesteTalar(data);
			break;
		case '/stryk':
			stryk(data.innlegg);
			break;
		case '/nyttInnlegg':
			nyttInnlegg(data.innlegg);
			break;
		case '/nyReplikk':
			nyReplikk(data.replikk);
			break;
		case '/flyttOpp':
			flyttOpp(data.innlegg);
			break;
		case '/flyttNed':
			flyttNed(data.innlegg);
			break;
		case '/tilDagsorden':
			tilDagsorden(data.innlegg);
			break;
	}
//	consolelog(clientId + ' . ' + channel + ' . ' + data.speaker);
});

app.get('/lm/taleliste', function (request, response) {
	lesInnTaleliste();
	response.jsonp({'response': heileTalelista, 'lastSpeaker': timestampCounter});
});
bayeux.attach(app);
app.listen(128, 'localhost');
console.log("Express server listening in %s mode", app.settings.env);
