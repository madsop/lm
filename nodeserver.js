var express = require('express');
var app = module.exports = express();

var fs = require('fs');

module.exports =  {
	write : function(  filename, data) {
		fs.writeFileSync(filename,data);
	}
};

/*app.get('/', function(request, response) {
	response.send('Hello world\n');
});
*/

app.get('/list*', function (request, response) {
/*	var stream = fs.createReadStream('testles.txt');i
	console.log(stream);
	stream.on('line', function(line) { 
		console.log(line); 
	});
*/
//	fs.readFile('testles.txt', 'utf8', function (err, data) { console.log(data); });
	fs.readFile('testles.txt', function(err, f){
	    var array = f.toString().trim().split('\n');
            console.log(array);
	    // use the array
	console.log(request.query);

	response.jsonp({'response': array, 'lastSpeaker': 2});
	 });
});
app.listen(128, 'localhost');


