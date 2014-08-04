'use strict';

var express = require('express'),
    router = express.Router(),
    runOptions = require('../options'),
    Device = require('../models/device.js');

router.route('/:id')

    .get(function (req, res, next) {

        Device.findOne({_id: req.params.id, realm: runOptions.options.realm}, function (err, device) {
            if (err) {
                next(err);
            } else {
                res.json(device);
            }
        });
    })

    .put(function (req, res, next) {

        Device.findOneAndUpdate({_id: req.params.id, realm: runOptions.options.realm}, req.body, function (err, device) {

            if (err) {
                next(err);
            } else {
                res.json({ message: 'Device ' + device.name + ' updated' });
            }

        });
    })

    .delete(function (req, res, next) {

        Device.findOneAndRemove({_id: req.params.id, realm: runOptions.options.realm}, function (err, device) {
            if (err) {
                next(err);
            } else {
                res.json({ message: 'Successfully deleted' + device.name });
            }
        });
    });

router.route('/')

    .post(function (req, res, next) {

        var device = new Device(req.body);
        device._doc.realm = runOptions.options.realm;

        device.save(function (err) {
            if (err) {
                next(err);
            } else {
                res.json({ message: 'Device ' + device.name + ' created' });
            }
        });

    })

    .get(function (req, res, next) {

        Device.find({ realm: runOptions.options.realm }, function (err, devices) {
            if (err) {
                next(err);
            } else {
                res.json(devices);
            }
        });

    });


module.exports.router = router;