'use strict';

var express = require('express');
var mqtt = require('mqtt');

var router = express.Router();

var mqtt_client;

// HTTP-MQTT bridge
router.route('/')

    .all(function (req, res, next) {

        var token_str = req.headers.authorization.split(" ");
        var token = token_str[1];

        mqtt_client = mqtt.connect('mqtt://JWT:' + token + '@localhost');

        mqtt_client
            .on('connect', function () {
                next();
            })
            .on('error', function (err) {
                next(err);
            })
            .options.reconnectPeriod = 0;
    })

    .post(function (req, res, next) {
        mqtt_client.publish(req.originalUrl, req.text, {qos: 0, retain: false}, function (err) {
            res.json({
                "status": "success",
                "data": {
                    topic: req.originalUrl,
                    payload: req.text
                },
                "message": 'Topic posted'
            });
            next();
        });
    })

    .get(function (req, res, next) {

        var retained_message;
        mqtt_client
            .subscribe(req.originalUrl)
            .on('message', function (topic, message) {
                retained_message = message;
                res.json({
                    "status": "success",
                    "data": {
                        topic: req.originalUrl,
                        payload: message
                    },
                    "message": 'Got topic'
                });
                next();
            });
        setTimeout(function () {
            if (!retained_message) {
                res.json({
                    "status": "success",
                    "data": {
                        topic: req.originalUrl,
                        payload: ' '
                    },
                    "message": 'Topic not available'
                });
                next();
            }
        }, 300);
    })

    .put(function (req, res, next) {
        mqtt_client.publish(req.originalUrl, req.text, {qos: 0, retain: true}, function () {
            res.json({
                "status": "success",
                "data": {
                    topic: req.originalUrl,
                    payload: req.text
                },
                "message": 'Put topic'
            });
            next();
        });
    })

    .delete(function (req, res, next) {
        mqtt_client.publish(req.originalUrl, '', {retain: true}, function () {
            res.json({
                "status": "success",
                "data": {
                    topic: req.originalUrl,
                    payload: ' '
                },
                "message": 'Delete topic'
            });
            next();
        });
    })

    .all(function (req, res, next) {
        if (mqtt_client.connected)
            mqtt_client.end();
    });

module.exports.router = router;