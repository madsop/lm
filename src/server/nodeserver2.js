var LM = this.LM || {};

(function (namespace) {
	var flatfile = require('flatfile'),
	faye = require('faye'),
	express = require('express'),
	fs = require('fs'),
	bayeux = new faye.NodeAdapter({mount: '/faye*', timeout: 45}),
	app = express();

	flatfile.db('data/t2.json', function(err, heileTalelista) {
		namespace.Filhandtering = function () {
			var timestampFilnamn = 'data/timestamp.txt',
			personFilnamn = 'data/personar.txt';

			this.lagreTaleliste = function (taleliste) {
				heileTalelista.save(function(err) {});
			};

			this.lagreTimestamp = function (counter) {
				writeFile(timestampFilnamn, counter);
			};

			this.lagrePersonar = function (personar) {
				writeFile(personFilnamn, JSON.stringify(personar));
			};

			this.lesTimestamp = function () {
				if (fs.existsSync(timestampFilnamn)) {
					return parseInt(fs.readFileSync(timestampFilnamn), 10);
				}
				fs.writeFile(timestampFilnamn, "");
				return 0;
			};

			function lesInnListe(filnamn) {
				if (fs.existsSync(filnamn)) {
					return JSON.parse(fs.readFileSync(filnamn));
				}
				fs.writeFile(filnamn, "[]");
				return JSON.parse("[]");
			}

			this.lesInnTaleliste = function () {
			};

			this.lesInnPersonar = function () {
				return lesInnListe(personFilnamn);
			};
		};

		namespace.Server = function () {
			var filhandtering = new namespace.Filhandtering(),
			client = bayeux.getClient(),
			timestampCounter = filhandtering.lesTimestamp(),
			personar = filhandtering.lesInnPersonar();

			this.getTalelista = function () { return heileTalelista; };
			this.getPersonlista = function () { return personar; };
			this.getTimestamp = function () { return timestampCounter; };

			function nesteTalar(taltTid) {
				if (heileTalelista[timestampCounter - 1] !== undefined) { heileTalelista[timestampCounter - 1].talttid = taltTid; }
				timestampCounter += 1;
				filhandtering.lagreTimestamp(timestampCounter);
				filhandtering.lagreTaleliste(heileTalelista);
			}

			function stryk(innleggId) {
				if (innleggId <= timestampCounter) { return; }
				var skalFjernes = _.find(heileTalelista, function (element) { return element.id === innleggId; });
				heileTalelista = _.without(heileTalelista, skalFjernes);
				filhandtering.lagreTaleliste(heileTalelista);
			}

			function nyInnleggsId() {
				var maksId = _.max(_.map(heileTalelista, function (element) { return element.id; }));
				if (maksId < 0) { return 0; }
				return maksId + 1;
			}

			function nyttInnlegg(innlegg) {
				innlegg.id = nyInnleggsId();
				heileTalelista.push(innlegg);
				client.publish('/nyttInnleggId', {id: innlegg.id});
				filhandtering.lagreTaleliste(heileTalelista);
			}

			function nyReplikk(replikk) {
				if (heileTalelista[timestampCounter - 1] !== undefined && heileTalelista[timestampCounter - 1].type === "Svarreplikk") { return; }
				var count = timestampCounter,
				itemInList = heileTalelista[count],
				originalInnlegget = null,
				svarreplikk = null;
				while (itemInList !== null && (itemInList.type !== "Innlegg" && itemInList.type !== "Svarreplikk")) {
					count += 1;
					itemInList = heileTalelista[count];
				}

				// svarreplikk
		        if (!(_.find(heileTalelista, function (obj) { return obj.type === "Svarreplikk"; }))) {
		        	originalInnlegget  = _.find(heileTalelista, function (element) { return element.type === 'Innlegg'; });
		        	svarreplikk = {type: 'Svarreplikk', speaker: originalInnlegget.speaker, id: nyInnleggsId()};
		        	heileTalelista.splice(count, 0, svarreplikk);
		        	client.publish('/nyttInnleggId', {id: svarreplikk.id});
		        }

		        replikk.id = nyInnleggsId();
		        heileTalelista.splice(count, 0, replikk);
		        client.publish('/nyttInnleggId', {id: replikk.id});
		        filhandtering.lagreTaleliste(heileTalelista);
		    }

		    function flytt(innlegg, opp) {
		    	common.flyttInnlegg(innlegg, opp, heileTalelista);
		    	filhandtering.lagreTaleliste(heileTalelista);
		    }

		    function tilDagsorden(innlegg) {
		    	innlegg.id = heileTalelista.length;
		    	if (_.first(heileTalelista).type !== "Til dagsorden") {
		    		heileTalelista.unshift(innlegg);
		    	} else {
		    		var indexToPutObject = _.find(heileTalelista, function (element) { return element.type !== "Til dagsorden"; });
		    		heileTalelista.splice(_.indexOf(heileTalelista, indexToPutObject), 0, innlegg);
		    	}
		    	client.publish('/nyttInnleggId', {id: innlegg.id});
		    	filhandtering.lagreTaleliste(heileTalelista);
		    }

		    function nyPerson(person) {
		    	personar.push(person);
		    	filhandtering.lagrePersonar(personar);
		    }

    		/*jslint unparam: true*/
		    bayeux.bind('publish', function (clientId, channel, data) {
		    	switch (channel) {
		    		case '/nesteTalar':
		    		nesteTalar(data.taltTid);
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

	/*jslint unparam: false*/
	model = new LM.Server();
	app.engine('html', require('ejs').renderFile);

	/*jslint unparam: true*/
	app.get('/lm/taleliste', function (request, response) {
		response.jsonp({'response': model.getTalelista(), 'lastSpeaker': model.getTimestamp()});
	});

	app.get('/lm/personliste', function (request, response) {
		response.jsonp({'response': model.getPersonlista()});
	});

	app.get('/', function (request, response) {
		response.render("index.html");
	});	

	/*jslint unparam: false*/
	bayeux.attach(app);
	console.log("Express server listening in %s mode", app.settings.env);

	var server = app.listen(128, function() {
		  		var host = server.address().address
		  		var port = server.address().port
		  		console.log('Example app listening at http://%s:%s', host, port)
		  		console.log(app.mountpath);
			}
		);
	});
}(LM));

if (typeof require === "function" && module !== "undefined") {
	module.exports.Filhandtering = LM.Filhandtering;
} 
