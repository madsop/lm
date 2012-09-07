function Song (tittel, spotifyURL, tekst) {
	this.tittel = ko.observable(tittel);
	this.spotifyURL = ko.observable(spotifyURL);
	this.tekst = ko.observable(tekst);
}
