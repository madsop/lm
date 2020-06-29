var LM = LM || {};

(function (namespace) {
var minutes = 0, seconds = 0, milisec = 0;
var snakkaDa = "";

namespace.reset = function (innlegg, harSnakka) {
	var s = parseInt(innlegg.taletid(harSnakka));
	minutes = Math.floor(s/60);
	seconds = s%60;
	seconds -= 1;
	milisec = 0;
	snakkaDa = innlegg;
}

namespace.Timer = function (snakkarNo) {
	if (typeof(snakkarNo) === 'undefined' || (snakkaDa != snakkarNo && typeof(snakkaDa) != 'undefined' )) { 
		return; 
	}
	 if(minutes<0 || minutes == 0 && seconds <= -1){
		document.getElementById('snakkande').innerHTML="Taletida er ute.";
		return;
 	 }

 	if (milisec<=0){
	    milisec=9
	    seconds-=1
	}
	if (seconds<=-1){
	    milisec=0
	    minutes-=1
	    seconds=60
	}
	 
	milisec-=1;
	if (seconds != 60) {
		var secs = (seconds < 10) ? '0' : '';
		secs += seconds;
		document.getElementById('snakkande').innerHTML=minutes+":"+secs;
	}
        setTimeout(namespace.Timer,100, snakkarNo);
};
}(LM));
