// const http = require('http');
const twilio = require('twilio');
const VoiceResponse = twilio.TwimlResponse;
const MessagingClient = twilio.IpMessagingClient;
var express = require('express');
var router = express.Router();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

router.post('/receiveCall', (req, res) => {
  const response = new VoiceResponse();
  console.log(req.body);
  console.log(response);

  if(req.body.SpeechResult){
    console.log(27, message);
    response.say(`You said ${req.body.SpeechResult}`);
    response.sms(`You said ${req.body.SpeechResult}`);
  } else {
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
