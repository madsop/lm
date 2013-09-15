if (typeof require !== undefined) { 
    var buster = require("buster");
    var faye = require('faye');
    var fs = require('fs');
    var LM = require('../../nodeserver.js');
//    var myLib = require("../lib/my-lib");
}

(function (namespace) {
buster.testCase("Test filhandtering her", {
    "lagre tom taleliste": function () {
	  var filehandler = new namespace.Filhandtering();
//		this.stub(filehandler, "writeFile");
		this.stub(fs, 'writeFile');
		filehandler.lagreTaleliste(['ihjhsdaffadsdfsaljhi']);
		assert.calledOnce(fs.writeFile);
     },

     "// lagre fylt taleliste": function () {
	assert(true);
     },

      "// lagre timestamp": function () {
     },

     "// les timestamp": function () {
     },

     "// les tom taleliste": function () {
     },

     "// les taleliste": function () {
    }
});
}(LM));
