function kommandeMedlem(medlem) {
	this.fornamn = ko.observable(medlem.fornamn);
	this.etternamn = ko.observable(medlem.etternamn);
	this.epost = ko.observable(medlem.epost);
	this.telefonnummer = ko.observable(medlem.telefonnummer);
	this.adresse = ko.observable(medlem.adresse);
	this.postnummer = ko.observable(medlem.postnummer);
	this.poststad = ko.observable(medlem.poststad);
	this.fodtdato = ko.observable(medlem.fodtdato);
	this.kommentarar = ko.observable(medlem.kommentarar);	
}
