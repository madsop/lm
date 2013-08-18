var LM = LM || {};

(function (namespace) {
"use strict";
namespace.BetterListModel = function () {
	var self = this;
	this.itemToAdd = ko.observable("");

	this.hub = namespace.hub.create();
	
	var receiveSpeakerList = function () {
		self.hub.onRefresh(receivePersonListFromServer);
	};
	
	this.allPersons = {
		Mads: namespace.Person.create({name:"Mads",kjonn:"M"}),
		Marie: namespace.Person.create({name:"Marie",kjonn:"K"}), 
		Seher: namespace.Person.create({name:"Seher",kjonn:"K"}), 
		Andreas: namespace.Person.create({name:"Andreas",kjonn:"M"})
	};

	this.activeSpeaker = ko.observable({speaker: {name: 'Pause'}, getType: function() { return 'mock'; }});

	var lagInnleggsobjekt = function (receivedInnlegg) {
		var innlegg = namespace.Innlegg.create({type:receivedInnlegg.type, speaker: receivedInnlegg.speaker, id: receivedInnlegg.id});
		return innlegg;
	}

	var receivePersonListFromServer = function (receivedInnleggs, lastTimestamp) {
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
	};

	receiveSpeakerList();

	this.fillSelect = function () {
		var returnText = "";
		_.each(this.allPersons, function (person) {returnText += "<option value='this.allPersons." + person.name + "'>" +person.name +"</option>" } );	
		document.getElementById('innleggsHaldar').innerHTML = returnText;
	}

	this.fillSelect();
	this.allItems = ko.observableArray([
/*		namespace.Innlegg.create({speaker:this.allPersons.Seher, type:"Innlegg"}),
		namespace.Innlegg.create({speaker:this.allPersons.Mads, type:"Innlegg"}),
		namespace.Innlegg.create({speaker:this.allPersons.Marie, type:"Innlegg"}) */
	]); // Initial items

	this.harSnakka = ko.observableArray([]);
	this.kjonnsprosent = ko.observable("-");
	var sisteInnlegg = this.activeSpeaker();

	this.addPerson = function () {
		if (this.itemToAdd() !== "") { // Prevent blanks
				var newPerson = namespace.Person.create({
				name:this.itemToAdd(),
				kjonn:kjonnList.options[kjonnList.selectedIndex].text
			});
			this.allPersons[newPerson.name] = newPerson; 
			this.fillSelect();
		}	
		this.itemToAdd(""); 
	}

	this.addInnlegg = function () {
		var selectList = document.getElementById("typeInnlegg");
		var personList = document.getElementById("innleggsHaldar");

		var type = selectList.options[selectList.selectedIndex].text;
		var speaker = this.allPersons[personList.options[personList.selectedIndex].text]
		var newInnlegg = namespace.Innlegg.create({
			type:type,
			speaker:speaker
		});

		if (newInnlegg.getType() === "Til dagsorden") {
			this.allItems.splice(0,0,newInnlegg);
		}
		else if (newInnlegg.getType() === "Replikk") {
			self.hub.nyReplikk(newInnlegg);
		}
		else {
			self.hub.nyttInnlegg(newInnlegg);
		}	
	};

	var nyttInnlegg = function (innlegg) {
		self.allItems.push(lagInnleggsobjekt(innlegg.innlegg));
	}	
	
	this.flyttOppTrykka = function (innlegg) {
		self.hub.flyttOpp(innlegg);
	}

	var flyttOpp = function (innlegg2) {
		var innlegg = innlegg2.innlegg,
		innlegg = _.find(self.allItems(), function (element) { return innlegg.id == element.id; });
	        var index = _.indexOf(self.allItems(), innlegg);

		if (index<1 || self.allItems()[index-1].type !== "Innlegg") { return; }
		self.allItems()[index] = self.allItems()[index-1];
		self.allItems()[index-1] = innlegg; 
		self.allItems.valueHasMutated();
	};

	this.flyttNedTrykka = function (innlegg) {
		self.hub.flyttNed(innlegg);
	}

	var flyttNed = function (innlegg2) {
		var innlegg = innlegg2.innlegg,
		innlegg = _.find(self.allItems(), function (element) { return innlegg.id == element.id; });
	        var index = _.indexOf(self.allItems(), innlegg);
	
		if (index===self.allItems().length-1 || self.allItems()[index].getType() !== "Innlegg") { return; }
		
		self.allItems()[index] = self.allItems()[index+1];
		self.allItems()[index+1] = innlegg;
		self.allItems.valueHasMutated();
	}

	var nyReplikk = function (newReplikk) {
		// legg inn replikk etter siste replikk eller første innlegg
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
		var innlegget = _.find(self.allItems(), function (innlegg) { 
			return innlegg.id == innleggId.innlegg; });
		self.allItems.remove(innlegget);
	}

	this.maybeRemoveSpeaker = function (speaker) {
		if (confirm("Er du sikker på at du vil stryke " +speaker.speakerName() +"?")) { 
			self.hub.stryk(speaker.id);
		}
	};

	var changeToNext = function () {
	}
 
	this.nextSpeaker = function (lastTimestamp) {
		lastTimestamp = lastTimestamp || self.activeSpeaker().id;
		if (self.activeSpeaker().getType() !== 'mock') { 
			self.harSnakka.push(self.activeSpeaker());
			oppdaterKjonnsfordeling();
		}
		self.activeSpeaker(_.first(self.allItems()));
		self.allItems.splice(0,1);
		namespace.reset(self.activeSpeaker(), self.harSnakka());
		new namespace.Timer(self.activeSpeaker());
		if (self.activeSpeaker().getType() === "Innlegg") { sisteInnlegg = self.activeSpeaker(); }
		self.hub.nesteTalar(self.activeSpeaker().id);
	};

	var oppdaterKjonnsfordeling = function () {
		var temp = _.countBy(self.harSnakka(), function (speakers) {
			if (speakers === undefined) { return; }
			return speakers.speaker.kjonn;
		});
		temp.M = temp.M || 0;
		temp.K = temp.K || 0;

		self.kjonnsprosent(((temp.K / (temp.M + temp.K))*100).toFixed(1) + "%"); 
	}
	
	self.hub.subscribe('/nesteTalar', function (a) { /*console.log(a);*/ });
	self.hub.subscribe('/stryk', function (innlegg) { strykInnlegg(innlegg); });
	self.hub.subscribe('/nyttInnlegg', function (innlegg) { nyttInnlegg(innlegg); });
	self.hub.subscribe('/nyReplikk', function (innlegg) { nyReplikk(innlegg); });
	self.hub.subscribe('/flyttOpp', function (innlegg) { flyttOpp(innlegg); });
	self.hub.subscribe('/flyttNed', function (innlegg) { flyttNed(innlegg); });
	self.hub.subscribe('/nyttInnleggId', function (innlegg) {
		var unset = _.find(self.allItems(), function (element) { return element.id == undefined; });
		unset.setId(innlegg.id); });
};
}(LM));
