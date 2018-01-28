var apiai = require('apiai');
var app = apiai(process.env.API_AI_TOKEN);
var { Place } = require('../models/models');//MAKE SURE TO HAVE THE CORRECT ROUTE FOR MODELS FILE
exports.twilioInput = function twilioInput(input, sessionId) {
    var request = app.textRequest(input, {
        session: sessionId
    });
    request.on('response', function(response) {
        console.log(response);
    })
    request.on('error', function(errer){
        console.log(error);
    })
    request.end();
};
