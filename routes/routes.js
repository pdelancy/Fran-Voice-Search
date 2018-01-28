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

//Expects an array of times with start (hours:minutes), end (hours:minutes), and days ['monday', 'tuesday', ...]
//Saves the times in an array of days, each with an array of times

router.post('/locationSchedule', (req, res) => {
  var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  Place.findOne({id: req.body.LocationId}, (err, loc) => {
    req.body.times.map((time) => {
      time.days.map((day) => {
        if(!loc.schedule[days.indexOf(day)]) loc.schedule[days.indexOf(day)] = [];
        var start = time.start.split(":");
        var end = time.end.split(":")
        loc.schedule[days.indexOf(day)].push({
          start: {h: start[0], minutes: start[1]},
          end: {h: end[0], minutes: end[1]}
        })
      })
    })
    loc.save((err, updatedLocation) => {
      err ? res.send({error: err}) : res.send(updatedLocation);
    })
  })
})

router.get('/response', (req, res) => {
  console.log(req.body);
})



module.exports = router;
