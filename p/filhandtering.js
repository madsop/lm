var LM = this.LM || {};
(function(namespace) {
    "use strict";

if (typeof require === "function" && typeof module !== "undefined") {
    LM.fs = require('fs');
}

namespace.Filhandtering = function () {
        var timestampFilnamn = 'data/timestamp.txt',
            tekstfilNamn = 'data/testles.txt',
            personFilnamn = 'data/personar.txt';
        
        function writeFile(filename, data) {
            namespace.fs.writeFile(filename, data, function (err) {
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
            if (namespace.fs.existsSync(timestampFilnamn)) {
                return parseInt(namespace.fs.readFileSync(timestampFilnamn), 10);
            }
            namespace.fs.writeFile(timestampFilnamn, "");
            return 0;
        };

        function lesInnListe(filnamn) {
            if (namespace.fs.existsSync(filnamn)) {
                return JSON.parse(namespace.fs.readFileSync(filnamn));
            }
            namespace.fs.writeFile(filnamn, "[]");
            return JSON.parse("[]");
        }

        this.lesInnTaleliste = function () {
            return lesInnListe(tekstfilNamn);
        };

        this.lesInnPersonar = function () {
            return lesInnListe(personFilnamn);
        };

        
        //module.exports.lesInnTaleliste = lesInnTaleliste;
      //  module.exports.lesTimestamp = lesTimestamp;
    };
})(LM);

if (typeof module === "object") {
    module.exports.Filhandtering = LM.Filhandtering;
}