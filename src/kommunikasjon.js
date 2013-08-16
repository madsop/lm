var LM = LM || {};

(function (namespace) {
"use strict";
	var hostURL = 'http://localhost:128';
	var client = new Faye.Client(hostURL+'/faye');

	var subscribe = function(channel, callback){
		client.subscribe(channel, callback);
		//function (message){	alert('message received: ' + message
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
		},
		nyPerson: function (person) {
		},
		nesteTalar: function (timestamp) {
			var publi = client.publish('/nesteTalar', {timestamp: timestamp});
	//		publi.callback(function() { alert('publication received'); });
		},
		flytting: function (innlegg, oppEllerNed) {
		},
		stryk: function (innlegg,callback) {
			var pb = publish('/stryk', {innlegg: innlegg});
			pb.callback(callback(innlegg));
		},
		onRefresh: function (callback) {
			subscribe('/nesteTalar', function (response) { console.log(response); });
			subscribe('/stryk', function () { });


//			client.publish('/faye', {text: 'testTekst'});
			$.ajax({
				url: hostURL +'/lm/taleliste',
				dataType: 'jsonp',
				data: { lastTimestamp: '00'},
				success: function (response) {
					var resp = response.response;
					var parsed = _.map(resp, function (element) { 
						return jQuery.parseJSON(element); 
					});
					callback(parsed, response.lastSpeaker);
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
