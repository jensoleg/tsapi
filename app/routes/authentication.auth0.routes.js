'use strict';

var express = require('express'),
    router = express.Router(),
    request = require('request'),
    runOptions = require('../options'),
    config = require('../../config.json');

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

        auth0API.url = config.domains[runOptions.options.realm].endpoint + req.url;
        auth0API.method = req.method;
        if (req.headers.authorization) {
            auth0API.headers.Authorization = req.headers.authorization;
        }
        auth0API.body = req.body;

        request(auth0API, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                res.json(body);
            } else if (!error) {
                res.status(response.statusCode).json(body);
            } else {
                next(error);
            }
        });

    });

module.exports.router = router;