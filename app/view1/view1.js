'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', function ($scope) {
var minutes = 0, seconds = 0, milisec = 0;
var snakkaDa = "";
	var beregnTaletid = function (innlegg) {
			if (innlegg.type === "Innlegg"){
				var speakers = _.filter(speakers, function (harSnakka) {harSnakka.type == "Innlegg"});
				speakers = _.pluck($scope.harSnakka, 'speaker');
				speakers = _.pluck(speakers, 'name');
				if (_.contains(speakers, innlegg.speaker.name)) {
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
	};
	var Innlegg = {
		create: function (params){
			var instance = Object.create(this);
			params = params || {};
			instance.type = params.type || "Innlegg";
			instance.speaker = params.speaker || {};
			instance.id = params.id || {};
			return instance;	
		},
		getType: function () {
			return this.type;
		},
		taletid: function (innlegg) {
			return beregnTaletid(innlegg);
		},
		speakerName: function () {
			return this.speaker.name;
		}
	};
	var Person = {
		create: function (params) {
			      var instance = Object.create(this);
			      params = params || {};
			      instance.name = params.name || "Manglar namn";
			      instance.kjonn = params.kjonn || "M";
			      return instance;
		},
		name: function () {
			return this.name;
		},
		getKjonn: function () {
			return this.kjonn;
		}

	};

	try {
		$scope.allPersons = JSON.parse(localStorage.allPersons);
	}
	catch(err) {
		$scope.allPersons = {};
	} /* {
		Mads: Person.create({name:"Mads",kjonn:"M"}),
		Marie: Person.create({name:"Marie",kjonn:"K"}), 
		Seher: Person.create({name:"Seher",kjonn:"K"}), 
		Pål: Person.create({name:"Pål",kjonn:"M"})
	};*/
	var reset = function (innlegg) {
		var taletid = Innlegg.taletid(innlegg);
		var s = parseInt(taletid);
		minutes = Math.floor(s/60);
		seconds = s%60;
		seconds -= 1;
		milisec = 0;
		snakkaDa = innlegg;
	};
	var Timer = function (snakkarNo) {
		if (typeof(snakkarNo) === 'undefined' || (snakkaDa != snakkarNo && typeof(snakkaDa) != 'undefined' )
			|| snakkarNoIsEmpty()) { 
			return; 
		}
		 if(minutes<0 || minutes == 0 && seconds <= -1){
			document.getElementById('snakkande').innerHTML="Taletida er ute.";
			return;
	 	 }

	 	if (milisec<=0){
		    milisec=9
		    seconds-=1
		}
		if (seconds<=-1){
		    milisec=0
		    minutes-=1
		    seconds=60
		}
		 
		milisec-=1;
		if (seconds != 60) {
			var secs = (seconds < 10) ? '0' : '';
			secs += seconds;
			document.getElementById('snakkande').innerHTML=minutes+":"+secs;
		}
		clearTimeout();
        setTimeout(Timer,100, snakkarNo);
	};

//	localStorage.taleliste = [];
	try {
		$scope.taleliste = JSON.parse(localStorage.taleliste);
	}
	catch(err) {
		$scope.taleliste = [];
	}
	/*[
		Innlegg.create({speaker:$scope.allPersons.Seher, type:"Innlegg"}),
		Innlegg.create({speaker:$scope.allPersons.Mads, type:"Innlegg"}),
		Innlegg.create({speaker:$scope.allPersons.Marie, type:"Innlegg"})
	]; // Initial items*/

	var self = this;

	var fillSelect = function () {
		var returnText = "";
		_.each($scope.allPersons, function (person) {returnText += "<option value='this.allPersons." + person.name + "'>" +person.name +"</option>" } );	
		document.getElementById('innleggsHaldar').innerHTML = returnText;
	}

	fillSelect();

//	localStorage.harSnakka = [];
	try {
		$scope.harSnakka = JSON.parse(localStorage.harSnakka);
	}
	catch(err) {
		$scope.harSnakka = [];
	}
//	this.harSnakka = ko.observableArray([]);
	
//	this.activeSpeaker = ko.observable(Innlegg.create({type:"Innlegg", speaker:this.allPersons.Marie}));								
	//reset(this.activeSpeaker(), this.harSnakka());
	var sisteInnlegg = this.activeSpeaker;

	$scope.addPerson = function (name, kjonn) {
		if (name !== "" && name != undefined) { // Prevent blanks
				var newPerson = Person.create({
					name:name,
					kjonn:kjonnList.options[kjonnList.selectedIndex].text
			});
			$scope.allPersons[newPerson.name] = newPerson;
			fillSelect();
			localStorage.allPersons = JSON.stringify($scope.allPersons);
		} 
	}

	$scope.addInnlegg = function () {
		var selectList = document.getElementById("typeInnlegg");
		var personList = document.getElementById("innleggsHaldar");

		var speaker = $scope.allPersons[personList.options[personList.selectedIndex].text];
		var type = selectList.options[selectList.selectedIndex].text;
		var newInnlegg = Innlegg.create({
			speaker:speaker,
			type:type,
			id:speaker.name + type + Math.random()
		});
		if (newInnlegg.getType() === "Til dagsorden") {
			$scope.taleliste.splice(0,0,newInnlegg);
		}
		else if (newInnlegg.getType() === "Replikk") {
			nyReplikk(newInnlegg);
		}
		else {
			$scope.taleliste.push(newInnlegg);
		}
		localStorage.taleliste = JSON.stringify($scope.taleliste);
	};
	
	$scope.flyttOpp = function (innlegg) {
		var index = $scope.taleliste.indexOf(innlegg);
		if (index===0 || $scope.taleliste[index-1].type !== "Innlegg") { return; }
		$scope.taleliste[index] = $scope.taleliste[index-1];
		$scope.taleliste[index-1] = innlegg;
		localStorage.taleliste = JSON.stringify($scope.taleliste);
	};

	$scope.flyttNed = function (innlegg) {
		var index = $scope.taleliste.indexOf(innlegg);
		if (index===$scope.taleliste.length-1 || $scope.taleliste[index].type !== "Innlegg") { return; }
		$scope.taleliste[index] = $scope.taleliste[index+1];
		$scope.taleliste[index+1] = innlegg;
		localStorage.taleliste = JSON.stringify($scope.taleliste);
	}

	var nyReplikk = function (newPerson) {
		var count = 0;
		var itemInList = $scope.taleliste[count];
		while (itemInList != null && ( itemInList.getType() !== "Innlegg" && itemInList.getType() !== "Svarreplikk" ) ) {
			count++;
			itemInList = $scope.taleliste[count];
		}
		if (!(_.find($scope.taleliste, function (obj) { return obj.getType() === "Svarreplikk";}))) {
			$scope.taleliste.splice(count,0, Innlegg.create({speaker:sisteInnlegg.speaker, type: "Svarreplikk"}));
		}
		$scope.taleliste.splice(count,0,newPerson);
	};

	$scope.maybeRemoveSpeaker = function (speaker) {
		if (confirm("Er du sikker på at du vil stryke " +speaker.speaker.name +"?")) { 
			$scope.taleliste = _.without($scope.taleliste, speaker);
			localStorage.taleliste = JSON.stringify($scope.taleliste);
		}
	};

	var snakkarNoIsEmpty = function () {
		return $scope.activeSpeaker == undefined || $scope.activeSpeaker.speaker == undefined
			|| $scope.activeSpeaker.speaker.name == '';
	}
	$scope.nextSpeaker = function () { 
		if (!snakkarNoIsEmpty()) {
			$scope.harSnakka.push($scope.activeSpeaker);
			oppdaterKjonnsfordeling();
		}
		$scope.activeSpeaker = _.first($scope.taleliste);
		$scope.taleliste.splice(0,1);
		if ($scope.activeSpeaker != undefined) {
			reset($scope.activeSpeaker);
			Timer($scope.activeSpeaker);
			if ($scope.activeSpeaker.type === "Innlegg") { sisteInnlegg = this.activeSpeaker; }
		}
		localStorage.taleliste = JSON.stringify($scope.taleliste);
		localStorage.harSnakka = JSON.stringify($scope.harSnakka);
		localStorage.activeSpeaker = JSON.stringify($scope.activeSpeaker);
	};

	var oppdaterKjonnsfordeling = function () {
		var temp = _.countBy($scope.harSnakka, function (speakers) {
			return speakers.speaker.kjonn;
		});
		if (typeof(temp.Mann) === "undefined" ) { temp.Mann = 0; }
		if (typeof(temp.Kvinne) === "undefined" ) { temp.Kvinne = 0; }

		$scope.kjonnsprosent = ((temp.Kvinne / (temp.Mann + temp.Kvinne))*100).toFixed(1) + "%"; 
	}

	$scope.feilfoert = function(speaker) {
		if (confirm("Er du sikker på at dette " +speaker.type + "et frå " +speaker.speaker.name +" var feilført og skal fjernastcd?")) { 
			$scope.harSnakka = _.without($scope.harSnakka, speaker);
			localStorage.harSnakka = JSON.stringify($scope.harSnakka);
		}
	};


	try {
		$scope.activeSpeaker = JSON.parse(localStorage.activeSpeaker);
	}
	catch(err) {
		$scope.activeSpeaker = {};
	}

	Timer(this.activeSpeaker);
	oppdaterKjonnsfordeling();

}]);
