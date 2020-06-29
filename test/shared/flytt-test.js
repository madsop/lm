if (typeof require === "function" && typeof module !== "undefined") {
   var buster = require("buster");
   var LM = this.LM || require("../../src/common"); 
}

(function (namespace) {
  "use strict";
   buster.testCase("Flytt innlegg", {

   "flytt i tom taleliste": function () {
	var inputInnlegg = {id: '0'};
	var innlegg = [inputInnlegg];
        LM.flyttInnlegg(inputInnlegg, true, innlegg);
	assert.equals(innlegg.length, 1);
   },

   "flytt opp innlegg": function () {
	var init0 = {id: '0', type: 'Innlegg'};
	var init1 = {id: '1', type: 'Innlegg'};
	var innlegg = [init0, init1];
	LM.flyttInnlegg(init1, true, innlegg);
	assert.equals(innlegg[0], init1);
	assert.equals(innlegg[1], init0);
	assert.equals(innlegg.length, 2);
   },

   "flytt opp innlegg som alt er på topp": function () {
	var init0 = {id: '0', type: 'Innlegg'};
	var init1 = {id: '1', type: 'Innlegg'};
	var innlegg = [init0, init1];
	LM.flyttInnlegg(init0, true, innlegg);
	assert.equals(innlegg[0], init0);
	assert.equals(innlegg[1], init1);
	assert.equals(innlegg.length, 2);
   },

   "flytt ned innlegg": function () {
	var init0 = {id: '0', type: 'Innlegg'};
	var init1 = {id: '1', type: 'Innlegg'};
	var innlegg = [init0, init1];
	LM.flyttInnlegg(init0, false, innlegg);
	assert.equals(innlegg[0], init1);
	assert.equals(innlegg[1], init0);
	assert.equals(innlegg.length, 2);
   },

   "flytt ned innlegg som alt er på botn": function () {
	var init0 = {id: '0', type: 'Innlegg'};
	var init1 = {id: '1', type: 'Innlegg'};
	var innlegg = [init0, init1];
	LM.flyttInnlegg(init1, false, innlegg);
	assert.equals(innlegg[0], init0);
	assert.equals(innlegg[1], init1);
	assert.equals(innlegg.length, 2);
   },
   });

}(LM));
