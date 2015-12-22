'use strict';

var express = require('express'),
    mongoose = require('mongoose'),
    MTS = require('mongoose-ts'),
    moment = require('moment'),
    _ = require('lodash'),
    uriUtil = require('mongodb-uri'),
    router = express.Router(),
    config = require('../../config.json'),
    formats = {'hash': 'hash', timestamp: '[x,y]', time: '[ms,y]'},
    intervals = ['1', '60', '3600'],
    LRU = require("lru-cache"),
    runOptions = require('../options'),
    lruOptions = {
        max: 500,
        length: function (n) {
            return n * 2;
        },
        dispose: function (key, n) {
        },
        maxAge: 1000 * 60 * 60
    },
    cache = LRU(lruOptions);

var options = {
    server: {
        socketOptions: {
            keepAlive: 1,
            connectTimeoutMS: 30000
        }
    }
};

var mongodbTSUri = config.tsstore.dbURI + config.tsstore.db + "?authMechanism=SCRAM-SHA-1",
    mongooseTSUri = uriUtil.formatMongoose(mongodbTSUri),
    TSconnection = mongoose.createConnection(mongooseTSUri, options);

// search time series database
router.route('/*')

    .get(function (req, res, next) {
        var topics, mts, collName,
            _request =
            {
                from: moment(moment()).utc().subtract(1,'d'),
                to: moment(moment()).utc(),
                condition: {},
                interval: 1,
                limit: 100,
                format: formats.hash
            };

        // start: start time
        if (req.query.from !== undefined) {
            if (!moment(req.query.from).isValid()) {
                return next(new Error('Invalid start timestamp'));
            } else {
                _request.from = moment(req.query.from).utc();
            }
        }

        // end:  end time - default now
        if (req.query.to !== undefined) {
            if (!moment(req.query.to).isValid()) {
                return next(new Error('Invalid end timestamp'));
            } else {
                _request.to = moment(req.query.to).utc();
            }
        }

        // interval: 0,60,3600 - default 0
        if (req.query.interval !== undefined) {
            if (!_.contains(intervals, req.query.interval)) {
                return next(new Error('Invalid interval - only 1 (seconds), 60 (minutes), 3600 (hours) allowed'));
            } else {
                _request.interval = parseInt(req.query.interval);
            }
        }

        // limit: default is 100 - max 1000
        if (req.query.limit !== undefined) {
            if (req.query.limit < 1 || req.query.limit > 2000) {
                return next(new Error('Invalid limit - must be in range 1-1000'));
            } else {
                _request.limit = parseInt(req.query.limit);
            }
        }

        // format : hash, timestamp, time
        if (req.query.format !== undefined) {
            if (!formats[req.query.format]) {
                return next(new Error('Invalid format  - only hash, timestamp, time allowed'));
            } else {
                _request.format = formats[req.query.format];
            }
        }

        // Build mongo collection identifier
        topics = req.params[0].split('/');
        collName = runOptions.options.realm;

        for (var x in topics) {
            collName = collName + '@' + topics[x];
        }

        mts = cache.get(collName);
        if (!mts) {
            mts = new MTS(TSconnection, collName, {interval: 1, verbose: config.tsstore.verbose});
            cache.set(collName, mts);
        }

        mts.findData(_request,
            function (error, data) {
                if (error) {
                    next(error);
                }
                else {
                    res.json({
                        "status": "success",
                        "message": data.length + ' readings found',
                        "topic": collName,
                        "search": _request,
                        "total": data.length,
                        "data": data
                    });
                }
            });

    });

module.exports.router = router;
