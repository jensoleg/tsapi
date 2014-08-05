'use strict';

var express = require('express'),
    router = express.Router(),
    request = require('request');

var
    agentApi = {
        url: 'http://agent.electricimp.com',
        json: true,
        method: undefined,
        headers: {
            Authorization: 'undefined',
        }
    };

router.route('/*')

    .all(function (req, res, next) {

        agentApi.url = 'http://agent.electricimp.com' + req.url;
        agentApi.headers.Authorization = req.headers.authorization;
        agentApi.method = req.method;
        agentApi.body = req.body;

        request(agentApi, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                res.json(body);
            } else {
                next(error);
            }
        });

    });

module.exports.router = router;