var LM = this.LM || {};

if (typeof require === "function" && module !== "undefined") {
    var _ = require("lodash");
}

(function (namespace) {
    "use strict";
    namespace.flyttInnlegg = function (innlegg2, opp, taleliste) {
        var innlegg = _.find(taleliste, function (element) { return innlegg2.id === element.id; }),
            index = _.indexOf(taleliste, innlegg);

        if (opp) {
            if (index < 1 || taleliste[index - 1].type !== "Innlegg") { return; }
            taleliste[index] = taleliste[index - 1];
            taleliste[index - 1] = innlegg;
        } else {
            if (index === taleliste.length - 1 || taleliste[index].type !== "Innlegg") { return; }
            taleliste[index] = taleliste[index + 1];
            taleliste[index + 1] = innlegg;
        }
    };
}(LM));

if (typeof require === "function" && module !== "undefined") {
    module.exports.flyttInnlegg = LM.flyttInnlegg;
}
