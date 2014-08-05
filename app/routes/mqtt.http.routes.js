'use strict';

var express = require('express'),
    mqtt = require('mqtt'),
    config = require('../../config.json'),
    runOptions = require('../options'),
    router = express.Router(),
    mqtt_client,
    topic,
    topicValue;

// HTTP-MQTT bridge
router.route('/*')

    .all(function (req, res, next) {

        var realm = runOptions.options.realm,
            token_str = req.headers.authorization.split(" "),
            token = token_str[1],
            connstring = 'mqtt://JWT@' + realm + ':' + token + '@' + config.mqtt.host + ':' + config.mqtt.port;

        if (req.body.value) {
            topicValue = req.body.value;
        } else {
            topicValue = JSON.stringify(req.body);
        }

        topic = '/' + realm + req.url;
        //topic = req.url;

        mqtt_client = mqtt.connect(connstring);

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

        mqtt_client.publish(topic, topicValue, {qos: 0, retain: false}, function (err) {

            res.json({
                "status": "success",
                "data": {
                    topic: topic,
                    payload: topicValue
                },
                "message": 'Topic posted'
            });

            next();
        });

    })

    .get(function (req, res, next) {

        var retained_message;

        mqtt_client
            .subscribe(topic)
            .on('message', function (topic, message) {

                retained_message = message;
                res.json({
                    "status": "success",
                    "data": {
                        topic: topic,
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
                        topic: topic,
                        payload: ' '
                    },
                    "message": 'Topic not available'
                });

                next();
            }

        }, 300);

    })

    .put(function (req, res, next) {

        mqtt_client.publish(topic, topicValue, {qos: 0, retain: true}, function () {

            res.json({
                "status": "success",
                "data": {
                    topic: topic,
                    payload: topicValue
                },
                "message": 'Put topic'
            });

            next();
        });

    })

    .delete(function (req, res, next) {

        mqtt_client.publish(topic, '', {retain: true}, function () {

            res.json({
                "status": "success",
                "data": {
                    topic: topic,
                    payload: ' '
                },
                "message": 'Delete topic'
            });

            next();
        });

    })

    .all(function (req, res, next) {

        if (mqtt_client.connected) {
            mqtt_client.end();
        }

    });

module.exports.router = router;