function verving() {
	var self = this;
	self.services = suapp.services;
	self.fornamnText = ko.observable("iasdafj");
	self.etternamnText = ko.observable();
	self.epostText = ko.observable();
	self.telefonnummerText = ko.observable();
	self.adresseText = ko.observable();
	self.postnummerText = ko.observable();
	self.poststadText = ko.observable();
	self.fodtdatoText = ko.observable();
	self.kommentararText = ko.observable();
	
	self.leggTilMedlem = function leggTilMedlem () {
		self.kommandeMedlem = new kommandeMedlem({
				fornamn: this.fornamnText(),
				etternamn: self.etternamnText(),
				epost: self.epostText(),
				telefonnummer: self.telefonnummerText(),
				adresse: self.adresseText(),
				postnummer: self.postnummerText(),
				poststad: self.poststadText(),
				fodtdato: self.fodtdatoText(),
				kommentarar: self.kommentararText()
		});
	}
	self.save = function save () {
		self.leggTilMedlem();
		self.services.save(self.kommandeMedlem, function (err, result) {
			if (err) {
				console.log("Some error occured: " + err);
             			throw "Application crashed";
			}
			console.log(result);
		});
	};
}
