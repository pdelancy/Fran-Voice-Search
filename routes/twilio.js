const twilio = require('twilio');
const VoiceResponse = twilio.TwimlResponse;
var express = require('express');
var router = express.Router();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
var apiai = require('apiai');
var app = apiai(process.env.API_AI_TOKEN);

router.post('/receiveCall', (req, res) => {
  const response = new VoiceResponse();
  let completed = false;
  let newResponse;

  if(req.body.SpeechResult){
    let input = req.body.SpeechResult;
    let dialogFlowResponded = false;
    //call dialogflow
    var request = app.textRequest(input, {
        sessionId: sessionId
    });

    request.on('response', function(response) {
        console.log(response);
        let newResponse = response.result.fulfillment.speech;
        let completed = !response.result.actionIncomplete;
    })

    while( !dialogFlowResponded ){
        console.log('\n waiting...');
        request.on('error', function(errer){
            console.log(error);
        })
    }

    response.say(newResponse);
    if(!completed){
      const gather = response.gather({
        input: 'speech dtmf',
        timeout: 3
        // action: '/readText',
        // method: 'GET'
        // numDigits: 1,
      });
    }
    // response.sms(`You said ${req.body.SpeechResult}`);

  } else if(!completed){
    response.say('Welcome to Fran A I! What can I help you with?');
    console.log(response.gather);
    const gather = response.gather({
      input: 'speech dtmf',
      timeout: 3
      // action: '/readText',
      // method: 'GET'
      // numDigits: 1,
    });
  }
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(response.toString());

})

module.exports = router;
