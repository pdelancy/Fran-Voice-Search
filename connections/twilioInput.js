var apiai = require('apiai');
var app = apiai(process.env.API_AI_TOKEN);
// var { Place } = require('../models/models');//MAKE SURE TO HAVE THE CORRECT ROUTE FOR MODELS FILE
var twilioInput = function twilioInput(input, sessionId) {
    var request = app.textRequest(input, {
        sessionId: sessionId
    });
    request.on('response', function(response) {
        console.log(response);
        let speech = response.result.fulfillment.speech;
        let complete = !response.result.actionIncomplete;
        let newResponse = {
          speech,
          complete
        }
        console.log('newResponse', newResponse);
        return newResponse;
    })
    request.on('error', function(errer){
        console.log(error);
    })
    request.end();
};

// twilioInput("Hiiiiiiiiiii!!!!", "10010");
