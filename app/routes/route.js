'use strict';

var express = require('express');
var router = express.Router();

// test route to make sure everything is working (accessed at GET http://localhost:<port>/)
router.get('/', function (req, res) {
    res.json({ message: 'hooray! welcome to Bobby Technologies api!' });
});

module.exports.router = router;