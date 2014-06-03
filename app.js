'use strict';

var express = require('express'),
    getRawBody = require('raw-body'),
    mongoose = require('mongoose'),
    jwt = require('express-jwt'),
    _ = require('lodash'),
    helmet = require('helmet'),
    config = require('./config.json'),
    mqttHttpBridge = require('./app/routes/mqtt.http.routes'),
    searchApi = require('./app/routes/timeseries.api.routes'),
    route = require('./app/routes/route');

var app = express();

var port = config.port || 8080;

mongoose.connect(config.mongoose.dbURI + config.mongoose.db);


// Use helmet to secure Express headers
app.use(helmet.xframe());
app.use(helmet.iexss());
app.use(helmet.contentTypeOptions());
app.use(helmet.ienoopen());
app.disable('x-powered-by');

var authenticate = jwt({
    secret: new Buffer(config.domains[req.url].clientSecret, 'base64'),
    audience: config.domains[req.url].clientId
});

//authenticate every api call
app.use('*', authenticate);

app.all('*', function (req, res, next) {
    // set origin policy etc so cross-domain access wont be an issue

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With,  Content-Type, Accept');

    if (!_.isEmpty(req.query)) {
        req.url = '/search' + req.url;
    } else
        req.url = '/mqtt';

    next();
});

// Get the raw body
app.use(function (req, res, next) {
    getRawBody(req, {
        length: req.headers['content-length'],
        limit: '1mb',
        encoding: 'utf8'
    }, function (err, string) {
        if (err)
            return next(err);

        req.text = string;
        next()
    })
});

// Register routes
app.use('/', route.router);
app.use('/mqtt', mqttHttpBridge.router);
app.use('/search', searchApi.router);

// Error handler ....
app.use(function (err, req, res, next) {
    res.send(400, {
        'status': 'error',
        'code': 404,
        'message': err.message
    });
});

// Start the server
app.listen(port);
console.log('Magic happens on port ' + port);
