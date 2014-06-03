'use strict';

var express = require('express'),
    MTS = require('mongoose-ts'),
    moment = require('moment'),
    _ = require('lodash'),
    config = require('../../config.json');

var router = express.Router();

var formats = {'hash': 'hash', timestamp: '[x,y]', time: '[ms,y]'};
var intervals = ['1', '60', '3600'];

// search time series database
router.route('/:device/:sensor')

    .get(function (req, res, next) {

        var _request =
        {
            from: moment().subtract('d', 1).toJSON(),
            to: moment().toJSON(),
            condition: {},
            interval: 1,
            limit: 100,
            format: formats.hash
        };

        // device: check existence
        if (req.params.device == undefined) {
            next(new Error('Please specify a device'));
        }

        // sensor: check valid combination /device/sensor
        if (req.params.sensor == undefined) {
            next(new Error('Please specify an event/sensor'));
        }

        // start: start time
        if (req.query.from != undefined) {
            if (!moment(req.query.from).isValid()) {
                next(new Error('Invalid start timestamp'));
            } else {
                _request.from = req.query.from;
            }
        }

        // end:  end time - default now
        if (req.query.to != undefined) {
            if (!moment(req.query.to).isValid()) {
                next(new Error('Invalid end timestamp'));
            } else {
                _request.to = req.query.to;
            }
        }

        // interval: 0,60,3600 - default 0
        if (req.query.interval != undefined) {
            if (!_.contains(intervals, req.query.interval)) {
                var err = new Error('Invalid interval - only 1 (seconds), 60 (minutes), 3600 (hours) allowed');
                next(err);
            } else {
                _request.interval = parseInt(req.query.interval);
            }
        }

        // limit: default is 100 - max 1000
        if (req.query.limit != undefined) {
            if (req.query.limit < 1 || req.query.limit > 1000) {
                next(new Error('Invalid limit - must be in range 1-1000'));
            } else {
                _request.limit = parseInt(req.query.limit);
            }
        }

        _request.format = 'hash';

        var mts = new MTS(req.originalUrl + '.' + req.params.device + '.' + req.params.sensor, {interval: 1});
        mts.findData(_request,
            function (error, data) {
                if (error) {
                    next(error);
                }
                else {
                    res.json({
                        "status": "success",
                        "message": data.length + ' readings data found',
                        "device": req.params.device,
                        "sensor": req.params.sensor,
                        "search": _request,
                        "total": data.length,
                        "data": data
                    });
                }
            });

    });

module.exports.router = router;
