var mongoose = require('mongoose');
var connect = process.env.MONGODB_URI;

mongoose.connect(connect);

var placeSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  schedule: {
    type: Object,
  },
  type: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String
  }

  /* Add other fields here */
});


var Place = mongoose.model('Place', placeSchema);


module.exports = {
  Place: Place,
};
