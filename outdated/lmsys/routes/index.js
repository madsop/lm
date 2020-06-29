var express = require('express');
var router = express.Router();
var app = require('../app.js');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index.jade', { title: 'Jade' });
});

router.get('/lm/taleliste', function (request, response) {
    response.jsonp({'response': model.getTalelista(), 'lastSpeaker': model.getTimestamp()});
});

router.get('/lm/personliste', function (request, response) {
    response.jsonp({'response': model.getPersonlista()});
});

module.exports = router;
