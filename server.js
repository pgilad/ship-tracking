var express = require('express');
var app = express();

var vesselLocations = require('./docs/vesselLocations.json');
var vesselInfo = require('./docs/vesselInfo.json');

app.get('/api/locations', function (req, res) {
  res.json(vesselLocations);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
