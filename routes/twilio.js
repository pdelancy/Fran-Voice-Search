const twilio = require('twilio');
const VoiceResponse = twilio.TwimlResponse;
var express = require('express');
var router = express.Router();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
var apiai = require('apiai-promise');
var app = apiai(process.env.API_AI_TOKEN);

router.post('/receiveCall', (req, res) => {
  const response = new VoiceResponse();
  let completed = false;
  let newResponse;

  if(req.body.SpeechResult){
    let input = req.body.SpeechResult;
    console.log(input);
    let dialogFlowResponded = false;
    //call dialogflow
    console.log("in conversation");
    console.log(req.body.From);
    app.textRequest(input, {
        sessionId: req.body.From
    }).then((response2) => {
      let newResponse = response2.result.fulfillment.speech;
      console.log(response);
      console.log(newResponse);
      let completed = !response2.result.actionIncomplete;
      dialogFlowResponded = true;
      response.say(JSON.stringify(newResponse));
      if(!completed){
        const gather = response.gather({
          input: 'speech dtmf',
          timeout: 3
          // action: '/readText',
          // method: 'GET'
          // numDigits: 1,
        });
        return;
      }
    }).then(() => {
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(response.toString());
    })
    .catch((err)=>{
      console.log(err);
    })
    // response.sms(`You said ${req.body.SpeechResult}`);

  } else if(!completed){
    response.say('Welcome to Fran A I! What can I help you with?');
    const gather = response.gather({
      input: 'speech dtmf',
      timeout: 3
      // action: '/readText',
      // method: 'GET'
      // numDigits: 1,
    });
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(response.toString());
  }
})

module.exports = router;
