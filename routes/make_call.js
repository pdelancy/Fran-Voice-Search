// Download the Node helper library from twilio.com/docs/node/install
// These consts are your accountSid and authToken from twilio.com/user/account
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const Twilio = require('twilio');
const client = new Twilio(accountSid, authToken);
console.log(client);
client.calls
  .create({
    url: 'http://demo.twilio.com/docs/voice.xml',
    to: '+13018730062',
    from: '+12408835764 ',
  })
  .then(call => console.log(call.sid));
