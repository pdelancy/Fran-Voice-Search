var apiai = require('apiai');
var app = apiai(process.env.API_AI_TOKEN);
var returnConversation = {
    continue: false,
    response: ""
};
//var { Place } = require('../models/models');//MAKE SURE TO HAVE THE CORRECT ROUTE FOR MODELS FILE
var twilioInput = function twilioInput(input, sessionId, object) {
    var request = app.textRequest(input, {
        sessionId: sessionId
    });
    request.on('response', function(response) {
        console.log(response);
        object.continue = !response.actionIncomplete;
        object.response = response.result.fulfillment.speech;
        console.log(returnConversation);//LET PAUL USE TWILIO RES.SEND(); AND END THE
    })
    request.on('error', function(error){
        console.log(error);
    })
    request.end();
};

twilioInput("where can I find food?", "121212451212", returnConversation);
// twilioInput("today", "121212451212", returnConversation);
// twilioInput("civic center", "121212451212", returnConversation);
