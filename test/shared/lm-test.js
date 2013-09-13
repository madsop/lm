if (typeof require != "undefined") {
    var buster = require("buster");
    var faye = require('faye');
//    var myLib = require("../lib/my-lib");
}

buster.testCase("Starttest", {
    "simpel": function () {
          assert.equals(4,4);
     }
});
