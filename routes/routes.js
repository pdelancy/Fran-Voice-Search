var express = require('express');
var router = express.Router();
var models = require('../models');

//////////////////////////////// PUBLIC ROUTES ////////////////////////////////
// Users who are not logged in can see these routes

router.get('/', function(req, res, next) {

});

router.get('/response', (req, res) => {
  console.log(req.body);
})


module.exports = router;
