'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    jwt = require('jsonwebtoken'),
    _ = require('lodash'),
    helmet = require('helmet'),
    config = require('./config.json'),
    mqttHttpBridge = require('./app/routes/mqtt.http.routes'),
    searchApi = require('./app/routes/timeseries.routes'),
    devicesApi = require('./app/routes/devices.routes'),
    auth0Api = require('./app/routes/auth0.api.routes'),
    electricImp = require('./app/routes/electricimp.agent.routes'),
    authentication = require('./app/routes/authentication.auth0.routes'),
    route = require('./app/routes/route'),
    runOptions = require('./app/options');

var app = express(),
    port = config.port || 8080;

// Use helmet to secure Express headers
app.use(helmet.xframe());
app.use(helmet.iexss());
app.use(helmet.contentTypeOptions());
app.use(helmet.ienoopen());
app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


app.all('*', function (req, res, next) {

    runOptions.set({realm: req.headers.realm});
    next();

});


app.all('*', function (req, res, next) {

    // set origin policy etc so cross-domain access wont be an issue
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With,  Content-Type, Accept');

    if ('OPTIONS' === req.method) {
        res.send(200);
    } else {
        next();
    }

});

app.use('/api/authenticate', authentication.router);

app.use('*', function (req, res, next) {

    var realm = runOptions.options.realm,
        secret = config.domains[realm].clientSecret,
        clientId = config.domains[realm].clientId,
        token_str = req.headers.authorization.split(" "),
        token = token_str[1];

    jwt.verify(token, new Buffer(secret, 'base64'), { audience: clientId }, function (err, decoded) {
        if (err) {
            next(err);
        }
        else {
            next();
        }
    });

});

// Register routes
app.use('/', route.router)
    .use('/api/agent', electricImp.router)
    .use('/api/broker', mqttHttpBridge.router)
    .use('/api/datastreams', searchApi.router)
    .use('/api/devices', devicesApi.router)
    .use('/api/auth', auth0Api.router);

// Error handler ....
app.use(function (err, req, res, next) {
    if (err) {
        res.json(400, {
            'status': 'error',
            'code': 404,
            'message': err.message,
            'error': err
        });
    }
});

// Start the server
app.listen(port);

console.log('Magic happens on port ' + port);