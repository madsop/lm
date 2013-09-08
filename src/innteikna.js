var LM = LM || {};

(function (namespace) {
"use strict";
namespace.BetterListModel = function () {
	var self = this;
	var hub, sisteInnlegg;
	this.harSnakka, this.kjonnsprosent, this.sstprosent, this.allItems, this.allPersons, this.newPersonName, this.activeSpeaker;

	var lagInnleggsobjekt = function (receivedInnlegg) {
		return namespace.Innlegg.create(receivedInnlegg);
	}

	var fillSelect = function () {
		var returnText = "";
		_.each(self.allPersons, function (person) {returnText += "<option value='this.allPersons." + person.name + "'>" +person.name +"</option>" } );	
		document.getElementById('innleggsHaldar').innerHTML = returnText;
	}
	
	var receiveInnleggListFromServer = function (receivedInnleggs, lastTimestamp) {
		var sortedList = _.sortBy(receivedInnleggs, function (person) { return person.timestamp; });
		_.each(sortedList, function (receivedInnlegg) {
			if (self.allPersons[receivedInnlegg.speaker.name] !== undefined) {
				var innlegg = lagInnleggsobjekt(receivedInnlegg);
				if (innlegg.id < lastTimestamp) {
					self.harSnakka.push(innlegg);
				}
				else {
					self.allItems.push(innlegg);
				}
			}
		});
		oppdaterKjonnsfordeling();
		oppdaterSSTprosent();
	};
	var receivePersonListFromServer = function (receivedPersons) {
		var sortedList = _.sortBy(receivedPersons, function (person) { return person.name; });
		_.each(sortedList, function (receivedPerson) { self.allPersons[receivedPerson.name] = namespace.Person.create(receivedPerson); });
		fillSelect();
	}

	this.addPerson = function () {
		if (this.newPersonName() !== "") { 
			var newPerson = namespace.Person.create({
				name:this.newPersonName(),
				kjonn:kjonnList.options[kjonnList.selectedIndex].text,
				verv:vervList.options[vervList.selectedIndex].text
			});
			hub.nyPerson(newPerson);
		}	
		this.newPersonName(""); 
	}

	var nyPerson = function (newPerson) {
		self.allPersons[newPerson.person.name] = newPerson.person;
		fillSelect();
	}

	this.addInnlegg = function () {
		var selectList = document.getElementById("typeInnlegg");
		var personList = document.getElementById("innleggsHaldar");

		var type = selectList.options[selectList.selectedIndex].text;

		if (type === "Replikk" && this.activeSpeaker().getType() === "Svarreplikk") { 
			return; 
		}
		
		var speaker = this.allPersons[personList.options[personList.selectedIndex].text]
		var newInnlegg = namespace.Innlegg.create({
			type:type,
			speaker:speaker
		});

		if (newInnlegg.getType() === "Til dagsorden") { 
			hub.tilDagsorden(newInnlegg);
		}
		else if (newInnlegg.getType() === "Replikk") {
			hub.nyReplikk(newInnlegg);
		}
		else {
			hub.nyttInnlegg(newInnlegg);
		}	
	};

	var nyttInnlegg = function (innlegg) {
		self.allItems.push(lagInnleggsobjekt(innlegg.innlegg));
	}
	var tilDagsorden = function (innlegg) {
		if (_.first(self.allItems()).type !== "Til dagsorden") {
			self.allItems.unshift(innlegg);
		}
		else {
			var indexToPutObject = _.find(self.allItems(), function (element) { return element.type !== "Til dagsorden"; });
			self.allItems.splice(_.indexOf(self.allItems(), indexToPutObject), 0, lagInnleggsobjekt(innlegg.innlegg));
		}
	}
	
	this.flyttOppTrykka = function (innlegg) {
		if (_.first(self.allItems()) !== innlegg){
			hub.flyttOpp(innlegg);
		}
	}

	var flyttInnlegg = function (innlegg2, opp) {
		var innlegg = innlegg2.innlegg;
		namespace.flyttInnlegg(innlegg, opp, self.allItems());
		self.allItems.valueHasMutated();
	}
	
	this.flyttNedTrykka = function (innlegg) {
		if (_.last(self.allItems()) !== innlegg) {
			hub.flyttNed(innlegg);
		}
	}

	var nyReplikk = function (newReplikk) {
		// legg inn replikk etter siste replikk eller første innlegg
		if (self.activeSpeaker().getType() === "Svarreplikk") { return; }
		var count = 0;
		var itemInList = self.allItems()[count];
		while (itemInList != null && ( itemInList.getType() !== "Innlegg" && itemInList.getType() !== "Svarreplikk" ) ) {
			count++;
			itemInList = self.allItems()[count];
		}

		//svarreplikk
		if (!(_.find(self.allItems(), function (obj) { return obj.getType() === "Svarreplikk";}))) {
			self.allItems.splice(count,0, namespace.Innlegg.create({speaker:sisteInnlegg.speaker, type: "Svarreplikk"}));
		}

		// legg til innlegg i liste
		self.allItems.splice(count,0,lagInnleggsobjekt(newReplikk.replikk));
	};

	var strykInnlegg = function(innleggId) {
		var innlegget = _.find(self.allItems(), function (innlegg) { return innlegg.id == innleggId.innlegg; });
		self.allItems.remove(innlegget);
	}

	this.maybeRemoveSpeaker = function (speaker) {
		if (confirm("Er du sikker på at du vil stryke " +speaker.speakerName() +"?")) { 
			hub.stryk(speaker.id);
		}
	};
	var taltTid = function () {
   		var periods = $('#countdown').countdown('getTimes');
		if (periods === null) { return '-'; }
		var inSeconds = $.countdown.periodsToSeconds(periods);
		var diff = self.activeSpeaker().taletid(self.harSnakka()) - inSeconds;
		return Math.floor(diff/60) +':' + (diff % 60); 
	} 

	this.nextSpeaker = function () {
		hub.nesteTalar(taltTid());
	};

	var nesteTalar = function () {
		if (self.activeSpeaker() !== undefined) {self.harSnakka.push(self.activeSpeaker());}
		oppdaterKjonnsfordeling();
		oppdaterSSTprosent();
		self.activeSpeaker(_.first(self.allItems()));
		self.allItems.splice(0,1);
		if (self.activeSpeaker().getType() === "Innlegg") { sisteInnlegg = self.activeSpeaker(); }
		var taletid = self.activeSpeaker().taletid(self.harSnakka());
		$('#countdown').countdown('destroy');
		$('#countdown').countdown({until: +taletid, layout: '{mn}:{sn}'});
	}

	var oppdaterKjonnsfordeling = function () {
		var temp = _.countBy(self.harSnakka(), function (speakers) {
			if (speakers === undefined) { return; }
			return speakers.speaker.kjonn;
		});
		temp.M = temp.M || 0;
		temp.K = temp.K || 0;

		self.kjonnsprosent(((temp.K / (temp.M + temp.K))*100).toFixed(1) + "%"); 
	}
	
	var oppdaterSSTprosent = function () {
		var temp = _.countBy(self.harSnakka(),function (speaker) {
			if (speaker === undefined) { return; }
			return speaker.speaker.verv;
		});
		temp.SST = temp.SST || 0;
		temp.LS = temp.LS || 0;
		
		self.sstprosent( (temp.SST/(self.harSnakka().length) * 100).toFixed(1) +"%");
	}

	var subscribe = function () {	
		hub.subscribe('/nesteTalar', function () { nesteTalar(); });
		hub.subscribe('/stryk', function (innlegg) { strykInnlegg(innlegg); });
		hub.subscribe('/nyPerson', function (person) { nyPerson(person); });
		hub.subscribe('/nyttInnlegg', function (innlegg) { nyttInnlegg(innlegg); });
		hub.subscribe('/nyReplikk', function (innlegg) { nyReplikk(innlegg); });
		hub.subscribe('/tilDagsorden', function (innlegg) { tilDagsorden(innlegg); });
		hub.subscribe('/flyttOpp', function (innlegg) { flyttInnlegg(innlegg, true); });
		hub.subscribe('/flyttNed', function (innlegg) { flyttInnlegg(innlegg, false); });
		hub.subscribe('/nyttInnleggId', function (innlegg) {
			var innleggUtanId = _.find(self.allItems(), function (element) { return element.id == undefined; });
			innleggUtanId.setId(innlegg.id); 
		});
		$('#pauseButton').click(function () {
			if ($(this).text() == 'Pause'){
				$(this).text('Resume');
				$('#countdown').countdown('pause');
			}
			else {
				$(this).text('Pause');
				$('#countdown').countdown('resume'); } });
	}

	var init = function() {
		self.allPersons = {};
		self.activeSpeaker = ko.observable();
		self.newPersonName = ko.observable("");
		self.harSnakka = ko.observableArray([]); 
		self.kjonnsprosent = ko.observable("-");
		self.sstprosent = ko.observable("-");
		self.allItems = ko.observableArray([]); 
		sisteInnlegg = self.activeSpeaker();
 		hub = namespace.hub.create();
		hub.onRefresh(receiveInnleggListFromServer, receivePersonListFromServer);
		fillSelect();
		subscribe();
	}();
};
}(LM));
