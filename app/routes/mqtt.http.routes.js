'use strict';

var express = require('express'),
    mqtt = require('mqtt'),
    config = require('../../config.json'),
    runOptions = require('../options'),
    router = express.Router();

// HTTP-MQTT bridge
router.route('/:device/:stream')

    .all(function (req, res, next) {

        var realm = runOptions.options.realm,
            token_str = req.headers.authorization.split(" "),
            token = token_str[1],
            connstring = 'mqtt://JWT@' + realm + ':' + token + '@' + config.mqtt.host + ':' + config.mqtt.port;

        req.mqtt_client = mqtt.connect(connstring);

        if (req.body.value) {
            req.topicValue = req.body.value;
        } else {
            req.topicValue = JSON.stringify(req.body);
        }

        req.topic = '/' + realm + req.url;

        next();
    })

    .post(function (req, res, next) {

        req.mqtt_client.publish(req.topic, req.topicValue, {qos: 0, retain: false}, function (err) {

            res.json({
                "status": "success",
                "data": {
                    topic: req.topic,
                    payload: req.topicValue
                },
                "message": 'Topic posted'
            });
        });

        req.mqtt_client.end();
    })

    .get(function (req, res, next) {

        req.mqtt_client
            .subscribe(req.topic)
            .on('message', function (topic, message) {

                req.mqtt_client.end();

                res.json({
                    "status": "success",
                    "data": {
                        topic: topic,
                        payload: message
                    },
                    "message": 'Got topic'
                });
            });

    })

    .put(function (req, res, next) {

        req.mqtt_client.publish(req.topic, req.topicValue, {qos: 0, retain: true}, function () {

            res.json({
                "status": "success",
                "data": {
                    topic: req.topic,
                    payload: req.topicValue
                },
                "message": 'Put topic'
            });
        });

        req.mqtt_client.end();

    })

    .delete(function (req, res, next) {

        req.mqtt_client.publish(req.topic, '', {retain: true}, function () {

            res.json({
                "status": "success",
                "data": {
                    topic: req.topic,
                    payload: ' '
                },
                "message": 'Delete topic'
            });

        });

        req.mqtt_client.end();

    });

module.exports.router = router;