'use strict';

var express = require('express'),
    router = express.Router(),
    request = require('request');

router.route('/test')

    .post(function (req, res, next) {

        request(req.body, function (error, response, body) {
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