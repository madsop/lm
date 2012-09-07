var suapp = suapp || {};
(function () {
    "use strict";
    suapp.services = suapp.services || {};
    suapp.services.save = function (data, callback) {
        callback(null, "saved data: " + data + ko.toJSON(data));
    };
    suapp.services.getSongar = function (data, callback) {
	callback(null, "henta songar!");
    };
}());
