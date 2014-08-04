'use strict';

var express = require('express'),
    moment = require('moment'),
    router = express.Router(),
    request = require('request'),
    runOptions = require('../options'),
    config = require('../../config.json');


var auth0Token = {
        url: undefined,
        method: 'POST',
        json: true,
        body: {
            client_id: undefined,
            client_secret: undefined,
            grant_type: 'client_credentials'
        }
    },
    auth0API = {
        url: undefined,
        json: true,
        method: undefined,
        headers: {
            Authorization: 'undefined'
        }
    },
    token = {
        token_type: undefined,
        access_token: undefined,
        exp: undefined
    };

// refresh token


router.use(function (req, res, next) {
    var elapsedTime = moment.duration(moment().diff(moment(token.exp))).get("minutes");

    if (token.exp && elapsedTime > 23) {
        token.exp = undefined;
    }
    next();

});


router.use(function (req, res, next) {

    if (!token.exp) {
        auth0Token.url = 'https://' + runOptions.options.realm + '.auth0.com/oauth/token';
        auth0Token.body.client_id = config.domains[runOptions.options.realm].clientId;
        auth0Token.body.client_secret = config.domains[runOptions.options.realm].clientSecret;

        request(auth0Token, function (error, response, body) {
            token.token_type = body.token_type;
            token.access_token = body.access_token;
            token.exp = Date.now();
            next();
        });
    } else {
        next();
    }

});

router.route('/*')

    .all(function (req, res, next) {

        auth0API.url = 'https://' + runOptions.options.realm + '.auth0.com/api' + req.url;
        auth0API.headers.Authorization = token.token_type + ' ' + token.access_token;
        auth0API.method = req.method;
        auth0API.body = req.body;

        request(auth0API, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                res.json(body);
            } else {
                next(error);
            }
        });

    });

module.exports.router = router;