var _ = require('lodash');
var bodyParser = require('body-parser');
var compress = require('compression');
var cookieParser = require('cookie-parser');
var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');

var app = express();
app.use(compress());
app.use(logger('dev'));
app.use(favicon(__dirname + '/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(cookieParser());

var vesselLocations = require('./docs/vesselLocations.json');
var vesselInfo = require('./docs/vesselInfo.json');

app.get('/api/locations', function(req, res) {
    res.json(vesselLocations);
});

app.get('/api/ships/:id', function(req, res) {
    var id = req.params.id;
    var ship = _.find(vesselInfo, { _id: id });
    if (!ship) {
        return res.status(404).send('Ship not found');
    }
    res.json(ship);
});

app.put('/api/ships/:id', function(req, res) {
    // TODO: handle data perseverance
    res.status(200).json(req.body);
});

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});
