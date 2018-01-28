var express = require('express');
var router = express.Router();
var models = require('../models/models');
var Place = models.Place;

//////////////////////////////// PUBLIC ROUTES ////////////////////////////////
// Users who are not logged in can see these routes


router.post('/addLocation', function(req, res) {
  console.log('in addLocation');
  console.log(Place);
  var adding = new models.Place({
    // Note: Calling the email form field 'username' here is intentional,
    //    passport is expecting a form field specifically named 'username'.
    //    There is a way to change the name it expects, but this is fine.
    name: req.body.name,
    location: req.body.location,
    schedule: req.body.schedule,
    type: req.body.type,
    phoneNumber: req.body.phoneNumber
  });
  adding.save(function(err, location) {
    if (err) {
      console.log(err);
      res.json({success: false})
    } else {
      console.log(location);
      res.json({
        success: true,
        location: location
      })
    }
  });
});

router.get('/response', (req, res) => {
  console.log(req.body);
})



module.exports = router;
