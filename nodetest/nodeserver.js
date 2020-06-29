    var express = require('express'),
        _ = require('lodash'),
        common = require('./src/common.js'),
        app = express()
        faye = require('faye'),
        bayeux = new faye.NodeAdapter({mount: '/faye*', timeout: 45});


    var LM = {
        server: require('./server.js')
    }

    var model = new LM.server();

    bayeux.attach(app);
    console.log("Express server listening in %s mode", app.settings.env);

//console.log(namespace);

if (typeof require === "function" && module !== "undefined") {
    module.exports.Filhandtering = LM.Filhandtering;
    module.exports.Server = LM.Server;
}
