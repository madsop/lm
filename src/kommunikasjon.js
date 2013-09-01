var LM = LM || {};

(function (namespace) {
"use strict";
	var hostURL = 'http://localhost:128';
	var client = new Faye.Client(hostURL+'/faye');

	var sub = function(channel, callback){
		client.subscribe(channel, callback);
	}

	var publish = function (channel, data) {
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
		},
		nesteTalar: function (timestamp) {
			publish('/nesteTalar', {timestamp: timestamp});
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
		onRefresh: function (callback) {
			$.ajax({
				url: hostURL +'/lm/taleliste',
				dataType: 'jsonp',
				data: { },
				success: function (response) {
					var resp = response.response;
					callback(resp, response.lastSpeaker);
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
