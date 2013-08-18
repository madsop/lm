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

	this.activeSpeaker = ko.observable();
	
	this.activeSpeakerName = (function () { //TODO: få denne til å funke...
		var returnText = ko.observable("");
		if (self.activeSpeaker() !== undefined){
			returnText = self.activeSpeaker().speakerName;
		}
		return returnText;
	})();

	var receivePersonListFromServer = function (receivedPersons, lastTimestamp) {
		var sortedList = _.sortBy(receivedPersons, function (person) { return person.timestamp; });
		_.each(sortedList, function (receivedPerson) {
			if (self.allPersons[receivedPerson.speaker] !== undefined) {
				var speaker = self.allPersons[receivedPerson.speaker];
				var innlegg = namespace.Innlegg.create({type:receivedPerson.type, speaker: speaker, id: receivedPerson.timestamp});

				if (innlegg.id < lastTimestamp) {
					self.harSnakka.push(innlegg);
				}
				else if (innlegg.id > lastTimestamp) {
					self.allItems.push(innlegg);
				}
				else {
					//console.log(innlegg.id);
				}
			}
		});
		self.nextSpeaker(lastTimestamp);
		//oppdaterKjonnsfordeling();
	};


	this.activeSpeaker = ko.observable(namespace.Innlegg.create({type:"Innlegg", speaker:this.allPersons.Marie}));			
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
	
//	namespace.reset(this.activeSpeaker(), this.harSnakka());
//	namespace.Timer(this.activeSpeaker());
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

		// server.addInnlegg(
		// speaker,
		// , type) - som under; stryk da resten av denne metoden (woho) - eller flytt logikken til ein annan stad eller noko sånt

		var newInnlegg = namespace.Innlegg.create({
			speaker:this.allPersons[personList.options[personList.selectedIndex].text],
			type:selectList.options[selectList.selectedIndex].text 
		});
		if (newInnlegg.getType() === "Til dagsorden") {
			this.allItems.splice(0,0,newInnlegg);
		}
		else if (newInnlegg.getType() === "Replikk") {
			nyReplikk(newInnlegg);
		}
		else {
			this.allItems.push(newInnlegg);
		}	
	};
	
	this.flyttOpp = function (innlegg) {
		var index = self.allItems.indexOf(innlegg);
		if (index===0 || self.allItems()[index-1].getType() !== "Innlegg") { return; }
		self.allItems()[index] = self.allItems()[index-1];
		self.allItems()[index-1] = innlegg;
		self.allItems.valueHasMutated();
	};

	this.flyttNed = function (innlegg) {
		var index = self.allItems.indexOf(innlegg);
		if (index===self.allItems().length-1 || self.allItems()[index].getType() !== "Innlegg") { return; }
		self.allItems()[index] = self.allItems()[index+1];
		self.allItems()[index+1] = innlegg;
		self.allItems.valueHasMutated();
	}

	var nyReplikk = function (newPerson) {
		var count = 0;
		var itemInList = self.allItems()[count];
		while (itemInList != null && ( itemInList.getType() !== "Innlegg" && itemInList.getType() !== "Svarreplikk" ) ) {
			count++;
			itemInList = self.allItems()[count];
		}
		if (!(_.find(self.allItems(), function (obj) { return obj.getType() === "Svarreplikk";}))) {
			self.allItems.splice(count,0, namespace.Innlegg.create({speaker:sisteInnlegg.speaker, type: "Svarreplikk"}));
		}
		self.allItems.splice(count,0,newPerson);
	};

	var strykInnlegg = function(innlegg) {
		self.allItems.remove(innlegg);
	}

	this.maybeRemoveSpeaker = function (speaker) {
		if (confirm("Er du sikker på at du vil stryke " +speaker.speakerName() +"?")) { 
			self.hub.stryk(speaker, strykInnlegg);
		}
	};
 
	this.nextSpeaker = function (lastTimestamp) { 
		lastTimestamp = lastTimestamp.timestamp || this.activeSpeaker().id;
		self.harSnakka.push(self.activeSpeaker());
		self.activeSpeaker(_.first(self.allItems()));
		self.allItems.splice(0,1);
		oppdaterKjonnsfordeling();
		namespace.reset(self.activeSpeaker(), self.harSnakka());
		new namespace.Timer(self.activeSpeaker());
		if (self.activeSpeaker().getType() === "Innlegg") { sisteInnlegg = self.activeSpeaker(); }
		self.hub.nesteTalar(self.activeSpeaker().id);
		// server.updateLastTimestamp(this.timestamp);  
	};

	var oppdaterKjonnsfordeling = function () {
		var temp = _.countBy(self.harSnakka(), function (speakers) {
			if (speakers === undefined) { return; }
			return speakers.speaker.kjonn;
		});
		if (typeof(temp.M) === "undefined" ) { temp.M = 0; }
		if (typeof(temp.K) === "undefined" ) { temp.K = 0; }

		self.kjonnsprosent(((temp.K / (temp.M + temp.K))*100).toFixed(1) + "%"); 
	}
	
	self.hub.subscribe('/nesteTalar', function (a) { console.log(a); });
	self.hub.subscribe('/stryk', function (innlegg) { strykInnlegg(innlegg); });
	
};
}(LM));
