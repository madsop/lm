var LM = LM || {};

(function (namespace) {
"use strict";
namespace.BetterListModel = function () {
	var self = this;
	this.newPersonName = ko.observable("");

	var hub = namespace.hub.create();
	
	this.allPersons = {
/*		Mads: namespace.Person.create({name:"Mads",kjonn:"M"}),
		Marie: namespace.Person.create({name:"Marie",kjonn:"K"}), 
		Seher: namespace.Person.create({name:"Seher",kjonn:"K"}), 
		Andreas: namespace.Person.create({name:"Andreas",kjonn:"M"}) */
	};

	this.activeSpeaker = ko.observable({speaker: {name: 'Pause'}, getType: function() { return 'mock'; }});

	var lagInnleggsobjekt = function (receivedInnlegg) {
		return namespace.Innlegg.create({type:receivedInnlegg.type, speaker: receivedInnlegg.speaker, id: receivedInnlegg.id});
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
		_.each(sortedList, function (receivedPerson) {
			self.allPersons[receivedPerson.name] = namespace.Person.create({name: receivedPerson.name, kjonn: receivedPerson.kjonn, verv: receivedPerson.verv});
		});
		fillSelect();
	}
	
	hub.onRefresh(receiveInnleggListFromServer, receivePersonListFromServer);

	var fillSelect = function () {
		var returnText = "";
		_.each(self.allPersons, function (person) {returnText += "<option value='this.allPersons." + person.name + "'>" +person.name +"</option>" } );	
		document.getElementById('innleggsHaldar').innerHTML = returnText;
	}

	fillSelect();
	this.allItems = ko.observableArray([]); 
	this.harSnakka = ko.observableArray([]); this.kjonnsprosent = ko.observable("-");
	this.sstprosent = ko.observable("-");
	var sisteInnlegg = this.activeSpeaker();

	this.addPerson = function () {
		if (this.newPersonName() !== "") { 
			var newPerson = namespace.Person.create({
				name:this.newPersonName(),
				kjonn:kjonnList.options[kjonnList.selectedIndex].text
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
		var innlegg = innlegg2.innlegg,
		innlegg = _.find(self.allItems(), function (element) { return innlegg.id == element.id; });
	        var index = _.indexOf(self.allItems(), innlegg);

		if (opp){
			if (index<1 || self.allItems()[index-1].type !== "Innlegg") { return; }
			self.allItems()[index] = self.allItems()[index-1];
			self.allItems()[index-1] = innlegg;
		}
		else {
			if (index===self.allItems().length-1 || self.allItems()[index].getType() !== "Innlegg") { return; }
			self.allItems()[index] = self.allItems()[index+1];
			self.allItems()[index+1] = innlegg;
		}
		self.allItems.valueHasMutated();
	}
	
	var flyttOpp = function (innlegg2) {
		flyttInnlegg(innlegg2, true);
	}

	this.flyttNedTrykka = function (innlegg) {
		if (_.last(self.allItems()) !== innlegg) {
			hub.flyttNed(innlegg);
		}
	}

	var flyttNed = function (innlegg2) {
		flyttInnlegg(innlegg2, false);
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

	this.nextSpeaker = function () {
		hub.nesteTalar(self.activeSpeaker().id);
	};

	var nesteTalar = function () {
		if (self.activeSpeaker().getType() !== 'mock') { 
			self.harSnakka.push(self.activeSpeaker());
			oppdaterKjonnsfordeling();
			oppdaterSSTprosent();
		}
		self.activeSpeaker(_.first(self.allItems()));
		self.allItems.splice(0,1);
		namespace.reset(self.activeSpeaker(), self.harSnakka());
		new namespace.Timer(self.activeSpeaker());
		if (self.activeSpeaker().getType() === "Innlegg") { sisteInnlegg = self.activeSpeaker(); }
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
		hub.subscribe('/flyttOpp', function (innlegg) { flyttOpp(innlegg); });
		hub.subscribe('/flyttNed', function (innlegg) { flyttNed(innlegg); });
		hub.subscribe('/nyttInnleggId', function (innlegg) {
			var innleggUtanId = _.find(self.allItems(), function (element) { return element.id == undefined; });
			innleggUtanId.setId(innlegg.id); 
		});
	}();
};
}(LM));
