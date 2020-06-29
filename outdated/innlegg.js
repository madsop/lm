var LM = LM || {};

(function (namespace) {
"use strict";
	var beregnTaletid = function (self, harSnakka) {
			if (self.type === "Innlegg"){
				var speakers = _.pluck(harSnakka, 'speaker');
				if (_.contains(speakers, self.speaker)) {
					return 120;
				}
				else {
					return 180;
				}
			}
			else if (self.type === "Replikk" || self.type === "Svarreplikk") {
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
		}
	};
}(LM));
