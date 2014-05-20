var express = require('express'); 		// call express
var app = express(); 				// define our app using express
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var MTI = require('mongoose-ts');
var jwt = require('express-jwt');
var moment = require('moment');
var _ = require('lodash');
var config = require('./config.json');

var port = process.env.PORT || config.port || 8080; 		// set our port

mongoose.connect(config.mongoose.db);

var formats = {'hash': 'hash', timestamp: '[x,y]', time: '[ms,y]'};
var intervals = ['1', '60', '3600'];

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser());

var authenticate = jwt({
    secret: new Buffer(config.auth0.clientSecret, 'base64'),
    audience: config.auth0.clientId
});
// authenticate every api call
app.use('/', authenticate);

app.all('/', function (req, res, next) {
    // set origin policy etc so cross-domain access wont be an issue

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,  Content-Type, Accept");
    next();
});

var router = express.Router(); 				// get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:<port>/api)
router.get('/', function (req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

router.route('/api/:device/:sensor', authenticate)

    .get(function (req, res, next) {

        var _request =
        {
            from: moment().subtract('d', 1).toJSON(),
            to: moment().toJSON(),
            condition: {},
            interval: 1,
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
                var err = new Error('Invalid interval - only 1 (seconds), 60 (minutes), 3600 (hours) allowed')
                next(err);
            } else {
                _request.interval = parseInt(req.query.interval);
            }
        }

        // limit: default is 100 - max 1000
        if (req.query.limit != undefined) {
            if (req.query.limit < 1 || req.query.limit > 1000) {
                next(new Error('Invalid limit - must be in rabge 1-1000'));
            } else {
                _request.limit = parseInt(req.query.limit);
            }
        }

        _request.format = 'hash';

        //var mti = new MTI(req.params.device + '-' + req.params.sensor, {interval: 1});
        var mti = new MTI('mycols', {interval: 1, verbose: config.mongoose.verbose});
        mti.findData(_request,
            function (error, data) {
                if (error)console.log(error);
                else res.json(data);
            });

    });


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);

// Error handler ....
app.use(function (err, req, res, next) {
    res.send(400, err.message);
});


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);