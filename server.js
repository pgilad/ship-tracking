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

app.get('/api/queries/biggest-ship', function(req, res) {
    const ship = _.max(vesselInfo, 'size');
    // TODO: handle failure
    res.status(200).json(ship);
});

app.post('/api/queries/grid', function(req, res) {
    const grid = req.body.grid;
    const ships = _.filter(vesselLocations, location => {
        const pos = location.lastpos.geometry.coordinates;
        if (pos[0] < grid.from[0]) {
            return false;
        }
        if (pos[0] > grid.to[0]) {
            return false;
        }
        if (pos[1] < grid.from[1]) {
            return false;
        }
        if (pos[1] > grid.to[1]) {
            return false;
        }
        return true;
    });
    res.status(200).send(ships);
});

app.put('/api/ships/:id', function(req, res) {
    // TODO: handle data perseverance
    res.status(200).json(req.body);
});

var port = 3000;
app.listen(port, function() {
    console.log('Windward server running on port:', port);
});
