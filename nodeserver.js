    var express = require('express'),
        _ = require('lodash'),
        common = require('./src/common.js'),
        app = express()
        faye = require('faye'),
        bayeux = new faye.NodeAdapter({mount: '/faye*', timeout: 45});

    /*jslint unparam: true*/
    app.all('/*', function (req, res, next) {
    //  console.log(res);
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Pragma, Content-Type");
        next();
    });
    /*jslint unparam: false*/

    app.configure(function () {
    //  app.set('views', __dirname + '/views');
      app.set('view engine', 'jade');
        app.use(express.bodyParser()); app.use(express.methodOverride()); app.use(app.router); app.use(bayeux); /*  app.use(function (req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        console.log(req);
        return next();
      }); */
     // app.use(express.static(__dirname + '/client_dependencies'));
    //  app.use(express.static(__dirname + '/public'));
    //  app.use(express.static(__dirname + '/lib'));
    });

    app.configure('development', function () {
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    });

    app.configure('production', function () {
        app.use(express.errorHandler());
    });

    // SETUP FERDIG HER
    /*jslint unparam: false*/

    var LM = {
        server: require('./server.js')
    }

    var model = new LM.server();

    /*jslint unparam: true*/
    app.get('/lm/taleliste', function (request, response) {
        response.jsonp({'response': model.getTalelista(), 'lastSpeaker': model.getTimestamp()});
    });

    app.get('/lm/personliste', function (request, response) {
        response.jsonp({'response': model.getPersonlista()});
    });

    /*jslint unparam: false*/

    bayeux.attach(app);
    app.listen(128, 'localhost');
    console.log("Express server listening in %s mode", app.settings.env);

//console.log(namespace);

if (typeof require === "function" && module !== "undefined") {
    module.exports.Filhandtering = LM.Filhandtering;
    module.exports.Server = LM.Server;
}
