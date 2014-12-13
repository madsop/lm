var LM = this.LM || {};

(function (namespace) {
    "use strict";
    namespace.Person = {
        create: function (params) {
            var instance = Object.create(this);
            params = params || {};
            instance.name = params.name || "Manglar namn";
            instance.kjonn = params.kjonn || "M";
            instance.verv = params.verv || "";
            return instance;
        },
        name: function () {
            return this.name;
        },
        getKjonn: function () {
            return this.kjonn;
        },
        verv: function () {
            return this.verv;
        }
    };
}(LM));
