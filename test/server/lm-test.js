if (typeof require !== undefined) { 
    var buster = require("buster");
    var faye = require('faye');
    var fs = require('fs');
    var LM = require('../../nodeserver.js');
}

(function (namespace) {
buster.testCase("Test filhandtering her", {
     setUp: function () {
	  this.filehandler = new namespace.Filhandtering();
          this.stub(fs, 'writeFile');
     },
    "lagre tom taleliste": function () {
		this.filehandler.lagreTaleliste(['ihjhsdaffadsdfsaljhi']);
		assert.calledOnce(fs.writeFile);
     },

     "lagre fylt taleliste": function () {
	var init0 = {id: '0'};
	var init1 = {id: '1'};
	var taleliste = [init0, init1];
	this.filehandler.lagreTaleliste(taleliste);
	assert.calledOnceWith(fs.writeFile, 'data/testles.txt', JSON.stringify(taleliste));
     },

      "lagre timestamp": function () {
          this.filehandler.lagreTimestamp(0);
          assert.calledOnceWith(fs.writeFile, 'data/timestamp.txt', 0);
     },

     "les timestamp": function () {
          this.stub(fs, 'readFileSync', function () { return 8; }); 
          var result = this.filehandler.lesTimestamp();
          assert.equals(result, 8);
     },

     "// les tom taleliste": function () {
     },

     "// les taleliste": function () {
    }
});
}(LM));
