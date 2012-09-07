buster.testCase("Verving", {
	"setUp": function () {
	},
	"data lagrast i objektet ved verving": function () {
		this.kommandeMedlem = new kommandeMedlem({
			fornamn: "Mads",
			etternamn: "Opheim",
			epost: "mads@fostad.net", 
			telefonnummer: 97589093, 
			adresse: "AdressaMi", 
			postnummer: 7021, 
			poststad: "Trondheim", 
			fodtdato: "30.10.87", 
			kommentarar: ""
		});
		assert.equals("Mads", this.kommandeMedlem.fornamn());
		assert.equals("Opheim", this.kommandeMedlem.etternamn());
		assert.equals("mads@fostad.net", this.kommandeMedlem.epost());
		assert.equals(97589093, this.kommandeMedlem.telefonnummer());
		assert.equals("AdressaMi", this.kommandeMedlem.adresse());
		assert.equals(7021, this.kommandeMedlem.postnummer());
		assert.equals("Trondheim", this.kommandeMedlem.poststad());
		assert.equals("30.10.87", this.kommandeMedlem.fodtdato());
		assert.equals("", this.kommandeMedlem.kommentarar());
	},
	"lagre medlem": function () {
		verving = new verving();
		verving.fornamnText("Mads");
		suapp.services.save = this.spy();
		refute.calledOnce(suapp.services.save);
		verving.save();
		assert.calledOnce(suapp.services.save);
		assert.equals("Mads", verving.kommandeMedlem.fornamn());
		assert.calledWith(suapp.services.save, verving.kommandeMedlem);
	}
}
);

buster.testCase("Songhefte", {
	"setUp": function () {
		this.song = new Song("Bella ciao", "spotifyurlher", "teksten");
	},
	"kan legge inn song": function () {
		assert.equals(this.song.tittel(), "Bella ciao");
	},
	"service eksisterer": function () {
		assert.defined(suapp.services.getSongar);
		var songar = [this.song];
		// gjer noko med songar her, dvs viewmodelstoff. 
	}
});
