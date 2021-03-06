'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    jwt = require('jsonwebtoken'),
    _ = require('lodash'),
    helmet = require('helmet'),
    config = require('./config.json'),
    mqttHttpBridge = require('./app/routes/mqtt.http.routes'),
    searchApi = require('./app/routes/timeseries.routes'),
    auth0Api = require('./app/routes/auth0.api.routes'),
    electricImp = require('./app/routes/electricimp.routes'),
    authentication = require('./app/routes/authentication.auth0.routes'),
    installationsAPI = require('./app/routes/installations.routes'),
    requester = require('./app/routes/request.routes'),
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

    if (req.headers.realm !== undefined) {
        runOptions.set({realm: req.headers.realm});
    } else {
        runOptions.set({realm: 'local'});
    }
    next();

});


app.all('*', function (req, res, next) {

    if ('OPTIONS' === req.method) {
        res.status(200).end();
    } else {
        next();
    }

});

app.use('/api/authenticate', authentication.router);

app.use('*', function (req, res, next) {

    var realm = runOptions.options.realm,
        secret = config.domains[realm].clientSecret,
        clientId = config.domains[realm].clientId,
        token_str = '',
        token = '';


    if (req.headers.authorization) {
        token_str = req.headers.authorization.split(" ");
        token = token_str[1]
    } else {
        return next(new Error('Authorization header is missing'));
    }

    jwt.verify(token, new Buffer(secret, 'base64'), { audience: clientId }, function (err, decoded) {
        if (err) {
            runOptions.options.currentUser = '';
            next(err);
        }
        else {
            runOptions.options.currentUser = decoded.name;
            next();
        }
    });

});

// Register routes
app.use('/', route.router)
    .use('/api/agent', electricImp.router)
    .use('/api/broker', mqttHttpBridge.router)
    .use('/api/datastreams', searchApi.router)
    .use('/api/auth', auth0Api.router)
    .use('/api/installations', installationsAPI.router)
    .use('/api/requests', requester.router);


// Error handler ....
app.use(function (err, req, res, next) {
    console.log('err:', err);
    if (err) {
        res.status(400).json({
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