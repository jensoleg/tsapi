'use strict';

var express = require('express'),
    router = express.Router(),
    request = require('request'),
    runOptions = require('../options'),
    config = require('../../config.json');

var
    agentApi = {
        url: '',
        json: true,
        method: undefined,
        headers: {
            Authorization: 'undefined'
        }
    };

router.route('/*')

    .all(function (req, res, next) {

        if (req.query.config !== undefined) {
            agentApi.body = {
                "params": req.body,
                "customer": runOptions.options.realm,
                "user": config.domains[runOptions.options.realm].user,
                "pass": config.domains[runOptions.options.realm].pass,
                "client_id": config.domains[runOptions.options.realm].clientId
            }
        } else {
            agentApi.body = req.body;
        }

        agentApi.url = 'http://agent.electricimp.com' + req.url;
        agentApi.headers.Authorization = req.headers.authorization;
        agentApi.method = req.method;

        request(agentApi, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                res.json(body);
            } else {
                next(error);
            }
        });

    });

module.exports.router = router;