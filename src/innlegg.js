var LM = LM || {};

(function (namespace) {
"use strict";
	var beregnTaletid = function (innlegg, harSnakka) {
			if (innlegg.type === "Innlegg"){
				var speakers = _.pluck(harSnakka, 'speaker');
				if (_.contains(speakers, innlegg.speaker)) {
					return 120;
				}
				else {
					return 180;
				}
			}
			else if (innlegg.type === "Replikk" || innlegg.type === "Svarreplikk") {
				return 60;
			}
			else {
				return 120;
			}
	}

	namespace.Innlegg = {
		create: function (params){
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
			return beregnTaletid(this,harSnakka);
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
