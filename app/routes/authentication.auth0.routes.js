'use strict';

var express = require('express'),
    router = express.Router(),
    request = require('request'),
    runOptions = require('../options');

var auth0API = {
        url: undefined,
        json: true,
        method: undefined,
        headers: {
            Authorization: 'undefined'
        }
    };


router.route('/*')

    .all(function (req, res, next) {

        auth0API.url = 'https://' + runOptions.options.realm + '.auth0.com' + req.url;
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