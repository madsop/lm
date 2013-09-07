var LM = LM || {};

var express = require('express'),
	faye = require('faye'),
	readline = require('readline'),
	fs = require('fs'),
	_ = require('lodash');
var common = require('./src/common/common.js');

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
 

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// SETUP FERDIG HER

(function (namespace) {

namespace.Filhandtering = function () {
	var timestampFilnamn = 'data/timestamp.txt';
	var tekstfilNamn = 'data/testles.txt';
	var personFilnamn = 'data/personar.txt';
	
	var writeFile = function (filename, data) {
		fs.writeFile(filename, data, function (err) {
			if (err) throw err;
			console.log('Lagra fil ' +filename + ' med ' + data);
		});
	}
	
	this.lagreTaleliste = function (taleliste) {
		writeFile(tekstfilNamn, JSON.stringify(taleliste));
	}
	this.lagreTimestamp = function (counter) {
		writeFile(timestampFilnamn, counter);
	}
	this.lagrePersonar = function (personar) {
		writeFile(personFilnamn, JSON.stringify(personar));
	}

	this.lesTimestamp = function () {
		if (fs.existsSync(timestampFilnamn)) {
			return parseInt(fs.readFileSync(timestampFilnamn));
		}
		else {
			fs.writeFile(timestampFilnamn, "");
			return 0; 
		}
	}

	var lesInnListe = function (filnamn) {
		if (fs.existsSync(filnamn)) {
			return JSON.parse(fs.readFileSync(filnamn));
		}
		else {
			fs.writeFile(filnamn, "[]");
			return JSON.parse("[]");
		}
	}

	this.lesInnTaleliste = function () {
		return lesInnListe(tekstfilNamn);
	}
	
	this.lesInnPersonar = function () {
		return lesInnListe(personFilnamn)
	}
}

namespace.Server = function () {
	var filhandtering = new namespace.Filhandtering();

	client = bayeux.getClient();

	var timestampCounter = filhandtering.lesTimestamp();

	var heileTalelista = filhandtering.lesInnTaleliste();

	var personar = filhandtering.lesInnPersonar();
		
	this.getTalelista = function () { return heileTalelista; }
	this.getPersonlista = function () { return personar; }
	this.getTimestamp = function () { return timestampCounter; }
	
	var nesteTalar = function (data){
		timestampCounter += 1;
		filhandtering.lagreTimestamp(timestampCounter);
	}
	var stryk = function (innleggId) {
		if (innleggId <= timestampCounter) { return; } 
		var skalFjernes = _.find(heileTalelista, function (element) { return element.id == innleggId; });
		heileTalelista = _.without(heileTalelista, skalFjernes);
		filhandtering.lagreTaleliste(heileTalelista);
	}

	var nyttInnlegg = function (innlegg) {
		innlegg.id = nyInnleggsId();
		heileTalelista.push(innlegg);
		client.publish('/nyttInnleggId', {id: innlegg.id});
		filhandtering.lagreTaleliste(heileTalelista);
	}	

	var nyInnleggsId = function () {
		var maksId = _.max(_.map(heileTalelista, function (element) { return element.id; }));
		if (maksId < 0) { return 0 };
		return maksId + 1;
	}

	var nyReplikk = function (replikk) {
		if (heileTalelista[timestampCounter-1] !== undefined && heileTalelista[timestampCounter-1].type === "Svarreplikk") { return; }
		var count = timestampCounter; 
		var itemInList = heileTalelista[count]; while (itemInList != null && ( itemInList.type !== "Innlegg" && itemInList.type !== "Svarreplikk" ) ) {
			count++;
			itemInList = heileTalelista[count];
		}
	
		//svarreplikk
		if (!(_.find(heileTalelista, function (obj) { return obj.type === "Svarreplikk";}))) {
			var originalInnlegget  = _.find(heileTalelista, function (element) { return element.type=='Innlegg';});
			var svarreplikk = {type:'Svarreplikk', speaker: originalInnlegget.speaker, id: nyInnleggsId()};
			heileTalelista.splice(count,0, svarreplikk);
			client.publish('/nyttInnleggId', {id: svarreplikk.id});
		}

		// legg til innlegg i liste
		replikk.id = nyInnleggsId();
		heileTalelista.splice(count,0,replikk);
		client.publish('/nyttInnleggId', {id: replikk.id});
		filhandtering.lagreTaleliste(heileTalelista);
	}

	var flytt = function (innlegg, opp) {
		common.flyttInnlegg(innlegg, opp, heileTalelista);
		filhandtering.lagreTaleliste(heileTalelista);
	}

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
		filhandtering.lagreTaleliste(heileTalelista);
	}

	var nyPerson = function (person) {
		personar.push(person);
		filhandtering.lagrePersonar(personar);
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
				flytt(data.innlegg, true);
				break;
			case '/flyttNed':
				flytt(data.innlegg, false);
				break;
			case '/tilDagsorden':
				tilDagsorden(data.innlegg);
				break;
			case '/nyPerson':
				nyPerson(data.person);
				break;
		}
	});
};

}(LM));

var model = new LM.Server();

app.get('/lm/taleliste', function (request, response) {
	response.jsonp({'response': model.getTalelista(), 'lastSpeaker': model.getTimestamp()});
});

app.get('/lm/personliste', function (request, response) {
	response.jsonp({'response': model.getPersonlista()});
});

bayeux.attach(app);
app.listen(128, 'localhost');
console.log("Express server listening in %s mode", app.settings.env);
