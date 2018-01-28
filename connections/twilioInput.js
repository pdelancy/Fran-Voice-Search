var apiai = require('apiai');
var app = apiai(process.env.API_AI_TOKEN);
<<<<<<< HEAD
var returnConversation = {
    continue: false,
    response: ""
};
//var { Place } = require('../models/models');//MAKE SURE TO HAVE THE CORRECT ROUTE FOR MODELS FILE
var twilioInput = function twilioInput(input, sessionId, object) {
=======
// var { Place } = require('../models/models');//MAKE SURE TO HAVE THE CORRECT ROUTE FOR MODELS FILE
var twilioInput = function twilioInput(input, sessionId) {
>>>>>>> master
    var request = app.textRequest(input, {
        sessionId: sessionId
    });
    request.on('response', function(response) {
        console.log(response);
<<<<<<< HEAD
        object.continue = !response.actionIncomplete;
        object.response = response.result.fulfillment.speech;
        console.log(returnConversation);//LET PAUL USE TWILIO RES.SEND(); AND END THE
=======
        let speech = response.result.fulfillment.speech;
        let complete = !response.result.actionIncomplete;
        let newResponse = {
          speech,
          complete
        }
        console.log('newResponse', newResponse);
        return newResponse;
>>>>>>> master
    })
    request.on('error', function(error){
        console.log(error);
    })
    request.end();
};

<<<<<<< HEAD
twilioInput("where do I get food?", "121212451212", returnConversation);
twilioInput("today", "121212451212", returnConversation);
twilioInput("civic center", "121212451212", returnConversation);
=======
// twilioInput("Hiiiiiiiiiii!!!!", "10010");
>>>>>>> master
