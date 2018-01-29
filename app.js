var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var connect = process.env.MONGODB_URI;

var REQUIRED_ENV = "MONGODB_URI".split(" ");

REQUIRED_ENV.forEach(function(el) {
  if (!process.env[el]){
    console.error("Missing required env var " + el);
    process.exit(1);
  }
});


mongoose.connect(connect);
var routes = require('./routes/routes');
var twilio = require('./routes/twilio');
var app = express();

app.use(logger('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/twilio', twilio);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

var port = process.env.PORT || 3030;
app.listen(port);
console.log('Express started. Listening on port %s', port);

module.exports = app;
