'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', function ($scope) {
var intercom = Intercom.getInstance();
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
	}

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

	var resetTaleliste = function () {
		//localStorage.taleliste = [];
		try {
			$scope.taleliste = JSON.parse(localStorage.taleliste);
		}
		catch(err) {
			$scope.taleliste = [];
		}
	};
	resetTaleliste();

	var self = this;

	var fillSelect = function () {
		var returnText = "";
		_.each($scope.allPersons, function (person) {returnText += "<option value='this.allPersons." + person.name + "'>" +person.name +"</option>" } );	
		document.getElementById('innleggsHaldar').innerHTML = returnText;
	}

	fillSelect();

	var resetHarSnakka = function () {
		//	localStorage.harSnakka = [];
		try {
			$scope.harSnakka = JSON.parse(localStorage.harSnakka);
		}
		catch(err) {
			$scope.harSnakka = [];
		}
	};
	resetHarSnakka();

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
		if (newInnlegg.type === "Til dagsorden") {
			$scope.taleliste.splice(0,0,newInnlegg);
		}
		else if (newInnlegg.type === "Replikk") {
			nyReplikk(newInnlegg);
		}
		else {
			$scope.taleliste.push(newInnlegg);
		}
		localStorage.taleliste = JSON.stringify($scope.taleliste);
		intercom.emit('taleliste', {});
	};
	
	$scope.flyttOpp = function (innlegg) {
		var index = $scope.taleliste.indexOf(innlegg);
		if (index===0 || $scope.taleliste[index-1].type !== "Innlegg") { return; }
		$scope.taleliste[index] = $scope.taleliste[index-1];
		$scope.taleliste[index-1] = innlegg;
		localStorage.taleliste = JSON.stringify($scope.taleliste);
		intercom.emit('taleliste', {});
	};

	$scope.flyttNed = function (innlegg) {
		var index = $scope.taleliste.indexOf(innlegg);
		if (index===$scope.taleliste.length-1 || $scope.taleliste[index].type !== "Innlegg") { return; }
		$scope.taleliste[index] = $scope.taleliste[index+1];
		$scope.taleliste[index+1] = innlegg;
		localStorage.taleliste = JSON.stringify($scope.taleliste);
		intercom.emit('taleliste', {});
	}

	var nyReplikk = function (newPerson) {
		var count = 0;
		var itemInList = $scope.taleliste[count];
		while (itemInList != null && itemInList != undefined && (itemInList.type !== "Innlegg" && itemInList.type !== "Svarreplikk" ) ) {
			count++;
			itemInList = $scope.taleliste[count];
		}
		if (!(_.find($scope.taleliste, function (obj) { return obj.type === "Svarreplikk";}))) {
			$scope.taleliste.splice(count,0, Innlegg.create({speaker:sisteInnlegg.speaker, type: "Svarreplikk"}));
		}
		$scope.taleliste.splice(count,0,newPerson);
	};

	$scope.maybeRemoveSpeaker = function (speaker) {
		if (confirm("Er du sikker på at du vil stryke " +speaker.type + " frå " +speaker.speaker.name +"?")) { 
			$scope.taleliste = _.without($scope.taleliste, speaker);
			localStorage.taleliste = JSON.stringify($scope.taleliste);
			intercom.emit('taleliste', {});
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

		if ($scope.taleliste != undefined && $scope.taleliste.length > 0) {
		$scope.taleliste.splice(0,1);
		}
		if ($scope.activeSpeaker != undefined) {
			reset($scope.activeSpeaker);
			Timer($scope.activeSpeaker);
			if ($scope.activeSpeaker.type === "Innlegg") { sisteInnlegg = this.activeSpeaker; }
		}
		localStorage.taleliste = JSON.stringify($scope.taleliste);
		localStorage.harSnakka = JSON.stringify($scope.harSnakka);
		localStorage.activeSpeaker = JSON.stringify($scope.activeSpeaker);
		intercom.emit('taleliste', {});
		intercom.emit('activeSpeaker', {});
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
		if (confirm("Er du sikker på at dette " +speaker.type + "et frå " +speaker.speaker.name +" var feilført og skal fjernast?")) { 
			$scope.harSnakka = _.without($scope.harSnakka, speaker);
			localStorage.harSnakka = JSON.stringify($scope.harSnakka);
		}
	};

	var downloadFile = function (data) {
		data = _.map(data, function (element) {
			return {"type": element.type, "name": element.speaker.name, "kjonn": element.speaker.kjonn};
		});
		data = "data:application/octet-stream;charset=utf-8," + encodeURIComponent(JSON.stringify(data)); 
		window.open(data);
	};


	var resetActiveSpeakerFromDisk = function () {
		try {
			$scope.activeSpeaker = JSON.parse(localStorage.activeSpeaker);
		}
		catch(err) {
			$scope.activeSpeaker = {};
		}
	};
	resetActiveSpeakerFromDisk();

	$scope.nextDebate = function () {
		if (!confirm("Er du sikker på at denne debatten er ferdig? Talelista vil bli sletta, og du kan ikkje angre dette")) {
			return;
		}
		downloadFile($scope.harSnakka);
		$scope.activeSpeaker = {};
		$scope.taleliste = [];
		$scope.harSnakka = [];
		$scope.kjonnsprosent = '';
		localStorage.kjonnsprosent = JSON.stringify($scope.kjonnsprosent);
		localStorage.harSnakka = JSON.stringify($scope.harSnakka);
		localStorage.taleliste = JSON.stringify($scope.taleliste);
		localStorage.activeSpeaker = JSON.stringify($scope.activeSpeaker);
		intercom.emit('taleliste', {});
		intercom.emit('activeSpeaker', {});
	}
	sisteInnlegg = $scope.activeSpeaker;

	Timer(this.activeSpeaker);
	oppdaterKjonnsfordeling();

}]);
