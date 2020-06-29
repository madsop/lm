/*global Faye, $, alert, console*/
var LM = this.LM || {};

(function (namespace) {
    "use strict";
    var hostURL = 'http://localhost:128',
        client = new Faye.Client(hostURL + '/faye');

    function sub(channel, callback) {
        client.subscribe(channel, callback);
    }

    function publish(channel, data) {
        return client.publish(channel, data);
    }

    namespace.hub = {
        create: function () {
            var instance = Object.create(this);
            return instance;
        },
        nyttInnlegg: function (innlegg) {
            publish('/nyttInnlegg', {innlegg: innlegg});
        },
        nyReplikk: function (replikk) {
            publish('/nyReplikk', {replikk: replikk});
        },
        tilDagsorden: function (innlegg) {
            publish('/tilDagsorden', {innlegg: innlegg});
        },
        nyPerson: function (person) {
            publish('/nyPerson', {person: person});
        },
        nesteTalar: function (taltTid) {
            publish('/nesteTalar', {taltTid: taltTid});
        },
        flyttOpp: function (innlegg) {
            publish('/flyttOpp', {innlegg: innlegg});
        },
        flyttNed: function (innlegg) {
            publish('/flyttNed', {innlegg: innlegg});
        },
        stryk: function (innlegg) {
            publish('/stryk', {innlegg: innlegg});
        },
        subscribe: function (keyword, callback) {
            sub(keyword, callback);
        },
        onRefresh: function (callback1, callback2) {
            $.ajax({
                url: hostURL + '/lm/personliste',
                dataType: 'jsonp',
                data: {},
                success: function (response) {
                    var resp = response.response;
                    callback2(resp);
                },
                error: function (xhr, error) {
                    alert(xhr.status + error);
                    console.log("readyState: " + xhr.readyState + "\nstatus: " + xhr.status);
                    console.log("responseText: " + xhr.responseText);
                }
            });
            $.ajax({
                url: hostURL + '/lm/taleliste',
                dataType: 'jsonp',
                data: { },
                success: function (response) {
                    var resp = response.response;
                    callback1(resp, response.lastSpeaker);
                },
                error: function (xhr, error) {
                    alert(xhr.status + error);
                    console.log("readyState: " + xhr.readyState + "\nstatus: " + xhr.status);
                    console.log("responseText: " + xhr.responseText);
                }
            });
        }
    };
}(LM));
