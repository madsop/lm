/*global _ */
var LM = this.LM || {};

(function (namespace) {
    "use strict";
    function beregnTaletid(innlegg, harSnakka) {
        if (innlegg.type === "Innlegg") {
            var speakers = _.pluck(harSnakka, 'speaker'),
                speakernames = _.pluck(speakers, 'name');
            if (_.contains(speakernames, innlegg.speaker.name)) {
                return 120;
            }
            return 180;
        }
        if (innlegg.type === "Replikk" || innlegg.type === "Svarreplikk") {
            return 60;
        }
        return 120;
    }

    namespace.Innlegg = {
        create: function (params) {
            var instance = Object.create(this);
            params = params || {};
            instance.type = params.type || "Innlegg";
            instance.speaker = params.speaker || {};
            instance.id = params.id;
            return instance;
        },
        getType: function () {
            return this.type;
        },
        taletid: function (harSnakka) {
            return beregnTaletid(this, harSnakka);
        },
        speakerName: function () {
            return this.speaker.name;
        },
        id: function () {
            return this.id;
        },
        setId: function (id) {
            this.id = id;
        }
    };
}(LM));
