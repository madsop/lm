var LM = this.LM || {};

(function (namespace) {
    "use strict";

    var express = require('express'),
        faye = require('faye'),
        fs = require('fs'),
        _ = require('lodash'),
        common = require('../common.js'),
        bayeux = new faye.NodeAdapter({mount: '/faye*', timeout: 45}),
        app = express(),
	flatfile = require('flatfile'),
        model = null;

    /*jslint unparam: true*/
/*    app.all('/*', function (req, res, next) {
    //  console.log(res);
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Pragma, Content-Type");
    });
*/    /*jslint unparam: false*/

    app.set('views', __dirname + '../../../views');
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'ejs');
//        app.use(express.bodyParser()); 
//app.use(express.methodOverride()); 
//app.use(app.router); 
//app.use(bayeux); 
/*  app.use(function (req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        console.log(req);
        return next();
      }); */
     // app.use(express.static(__dirname + '/client_dependencies'));
      app.use(express.static(__dirname + '../../lib'));
	app.use(express.static('stylesheet.css'));
    //  app.use(express.static(__dirname + '/lib'));

//    app.engine('.html', require('jade'));
 /*   app.configure('development', function () {
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    });

    app.configure('production', function () {
        app.use(express.errorHandler());
    });
*/
	app.locals._ = require('underscore');
	

    // SETUP FERDIG HER

    namespace.Filhandtering = function () {
        var timestampFilnamn = 'data/timestamp.txt',
            tekstfilNamn = 'data/testles.txt',
            personFilnamn = 'data/personar.txt';
        function writeFile(filename, data) {
            fs.writeFile(filename, data, function (err) {
                if (err) { throw err; }
            //            console.log('Lagra fil ' +filename + ' med ' + data);
            });
        }

        this.lagreTaleliste = function (taleliste) {
            writeFile(tekstfilNamn, JSON.stringify(taleliste));
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
            return lesInnListe(tekstfilNamn);
        };

        this.lesInnPersonar = function () {
            return lesInnListe(personFilnamn);
        };
    };

    namespace.Server = function () {
        var filhandtering = new namespace.Filhandtering(),
            client = bayeux.getClient(),
            timestampCounter = filhandtering.lesTimestamp(),
            heileTalelista = filhandtering.lesInnTaleliste(),
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

        //svarreplikk
            if (!(_.find(heileTalelista, function (obj) { return obj.type === "Svarreplikk"; }))) {
                originalInnlegget  = _.find(heileTalelista, function (element) { return element.type === 'Innlegg'; });
                svarreplikk = {type: 'Svarreplikk', speaker: originalInnlegget.speaker, id: nyInnleggsId()};
                heileTalelista.splice(count, 0, svarreplikk);
                client.publish('/nyttInnleggId', {id: svarreplikk.id});
            }

        // legg til innlegg i liste
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
    app.listen(128, 'localhost');
    console.log("Express server listening in %s mode", app.settings.env);

console.log(namespace);
}(LM));

if (typeof require === "function" && module !== "undefined") {
    module.exports.Filhandtering = LM.Filhandtering;
}
