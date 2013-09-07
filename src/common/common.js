var LM = LM || {};

if (typeof require === "function" && typeof module !== "undefined") {
  var _ = require("lodash");
}

(function (namespace) {
	namespace.flyttInnlegg = function (innlegg, opp, taleliste) { 
		var innlegg = _.find(taleliste, function (element) { return innlegg.id == element.id; });
	        var index = _.indexOf(taleliste, innlegg);

		if (opp){
			if (index<1 || taleliste[index-1].type !== "Innlegg") { return; }
			taleliste[index] = taleliste[index-1];
			taleliste[index-1] = innlegg;
		}
		else {
			if (index===taleliste.length-1 || taleliste[index].type !== "Innlegg") { return; }
			taleliste[index] = taleliste[index+1];
			taleliste[index+1] = innlegg;
		}
	};
}(LM));

if (typeof require === "function" && typeof module !== "undefined") {
	module.exports.flyttInnlegg = LM.flyttInnlegg;
}
