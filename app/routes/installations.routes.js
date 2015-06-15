'use strict';

var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    runOptions = require('../options'),
    Installation = require('devices'),
    installation,
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

    installation = new Installation(conn, runOptions.options.realm + '.installation');
    next();

});


router.route('/allTriggers')

    .get(function (req, res, next) {

        installation.allTrigger(function (err, data) {
            if (err) {
                next(err);
            } else {
                res.json(data);
            }
        });

    });

router.route('/:id')

    .get(function (req, res, next) {

        installation.getInstallation(req.params.id, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.json(data);
            }
        });
    })

    .put(function (req, res, next) {

        var thisInstallation = req.body;

        installation.updateInstallation(req.params.id, runOptions.options.currentUser, thisInstallation, function (err) {

            if (err) {
                next(err);
            } else {
                res.json({ message: 'Installation ' + thisInstallation.name + ' updated' });
            }

        });
    })

    .delete(function (req, res, next) {

        installation.removeInstallation(req.params.id, function (err) {
            if (err) {
                next(err);
            } else {
                res.json({ message: 'Successfully deleted installation: ' + req.params.id});
            }
        });
    });

router.route('/:id/devices')

    .post(function (req, res, next) {

        installation.newDevice(req.params.id, req.body, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.json(data);
            }
        });

    });

router.route('/:id/devices/:deviceid')

    .get(function (req, res, next) {

        installation.getDevice(req.params.id, req.params.deviceid, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.json(data);
            }
        });

    })

    .delete(function (req, res, next) {

        installation.removeDevice(req.params.id, req.params.deviceid, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.json(data);
            }
        });

    })

    .put(function (req, res, next) {

        var thisDevice = req.body;

        installation.updateDevice(req.params.id, req.params.deviceid, thisDevice, function (err, data) {

            if (err) {
                next(err);
            } else {
                res.json(data);
            }

        });

    });


router.route('/:id/devices/:deviceid/controls')

    .post(function (req, res, next) {

        installation.newControl(req.params.id, req.params.deviceid, req.body, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.json(data);
            }
        });

    });

router.route('/:id/devices/:deviceid/controls/:controlid')

    .get(function (req, res, next) {

        installation.getControl(req.params.id, req.params.deviceid, req.params.controlid, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.json(data);
            }
        });

    })

    .delete(function (req, res, next) {

        installation.removeControl(req.params.id, req.params.deviceid, req.params.controlid, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.json(data);
            }
        });

    })

    .put(function (req, res, next) {

        var thisControl = req.body;

        installation.updateControl(req.params.id, req.params.deviceid, req.params.controlid, thisControl, function (err, data) {

            if (err) {
                next(err);
            } else {
                res.json(data);
            }

        });

    });


router.route('/:id/devices/:deviceid/triggers')

    .post(function (req, res, next) {

        installation.newTrigger(req.params.id, req.params.deviceid, req.body, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.json(data);
            }
        });

    });

router.route('/:id/devices/:deviceid/triggers/:triggerid')

    .get(function (req, res, next) {

        installation.getTrigger(req.params.id, req.params.deviceid, req.params.triggerid, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.json(data);
            }
        });

    })

    .delete(function (req, res, next) {

        installation.removeTrigger(req.params.id, req.params.deviceid, req.params.triggerid, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.json(data);
            }
        });

    })

    .put(function (req, res, next) {

        var thisTrigger = req.body;

        installation.updateTrigger(req.params.id, req.params.deviceid, req.params.triggerid, thisTrigger, function (err, data) {

            if (err) {
                next(err);
            } else {
                res.json(data);
            }

        });

    });


/* requests */


router.route('/:id/devices/:deviceid/triggers/:triggerid/requests/:requestid')


    .get(function (req, res, next) {

        installation.getRequest(req.params.id, req.params.deviceid, req.params.triggerid, req.params.requestid, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.json(data);
            }
        });

    })

    .delete(function (req, res, next) {

        installation.removeRequest(req.params.id, req.params.deviceid, req.params.triggerid, req.params.requestid, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.json(data);
            }
        });

    })

    .put(function (req, res, next) {

        var thisControl = req.body;

        installation.updateRequest(req.params.id, req.params.deviceid, req.params.triggerid, req.params.requestid, thisControl, function (err, data) {

            if (err) {
                next(err);
            } else {
                res.json(data);
            }

        });

    });

router.route('/:id/devices/:deviceid/triggers/:triggerid/requests')

    .post(function (req, res, next) {

        installation.newRequest(req.params.id, req.params.deviceid, req.params.triggerid, req.body, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.json(data);
            }
        });

    });

router.route('/:id/devices/:deviceid/triggers/:triggerid/requests/requestid')


    .get(function (req, res, next) {

        installation.getRequest(req.params.id, req.params.deviceid, req.params.triggerid, req.params.requestid, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.json(data);
            }
        });

    })

    .delete(function (req, res, next) {

        installation.removeRequest(req.params.id, req.params.deviceid, req.params.triggerid, req.params.requestid, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.json(data);
            }
        });

    })

    .put(function (req, res, next) {

        var thisRequest = req.body;

        installation.updateRequest(req.params.id, req.params.deviceid, req.params.triggerid, req.params.requestid, thisRequest, function (err, data) {

            if (err) {
                next(err);
            } else {
                res.json(data);
            }

        });

    });

router.route('/')

    .post(function (req, res, next) {

        installation.createInstallation(req.body, runOptions.options.currentUser, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.json(data);
            }
        });

    })

    .get(function (req, res, next) {

        installation.allInstallations(function (err, data) {
            if (err) {
                next(err);
            } else {
                res.json(data);
            }
        });

    });

module.exports.router = router;