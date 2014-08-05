'use strict';

var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    runOptions = require('../options'),
    Device = require('../models/device.js'),
    deviceModel,
    uriUtil = require('mongodb-uri'),
    config = require('../../config.json');


var options = {
        server: {
            socketOptions: {
                keepAlive: 1,
                connectTimeoutMS: 30000
            }
        }
    },

    mongodbUri = config.bobby.dbURI + config.bobby.db,
    mongooseUri = uriUtil.formatMongoose(mongodbUri),
    conn = mongoose.createConnection(mongooseUri, options);

router.use(function (req, res, next) {

    deviceModel = conn.model(runOptions.options.realm, Device.schema, runOptions.options.realm + '.devices');
    next();

});

router.route('/:id')

    .get(function (req, res, next) {

        deviceModel.findOne({_id: req.params.id}, function (err, device) {
            if (err) {
                next(err);
            } else {
                res.json(device);
            }
        });
    })

    .put(function (req, res, next) {

        deviceModel.findOneAndUpdate({_id: req.params.id}, req.body, function (err, device) {

            if (err) {
                next(err);
            } else {
                res.json({ message: 'Device ' + device.name + ' updated' });
            }

        });
    })

    .delete(function (req, res, next) {

        deviceModel.findOneAndRemove({_id: req.params.id}, function (err, device) {
            if (err) {
                next(err);
            } else {
                res.json({ message: 'Successfully deleted' + device.name });
            }
        });
    });

router.route('/')

    .post(function (req, res, next) {

        var device = new deviceModel(req.body);

        device.save(function (err) {
            if (err) {
                next(err);
            } else {
                res.json({ message: 'Device ' + device.name + ' created' });
            }
        });

    })

    .get(function (req, res, next) {

        deviceModel.find(function (err, devices) {
            if (err) {
                next(err);
            } else {
                res.json(devices);
            }
        });

    });


module.exports.router = router;