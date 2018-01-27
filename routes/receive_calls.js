const http = require('http');
const VoiceResponse = require('twilio').TwimlResponse;
console.log(VoiceResponse);

http.createServer((req, res) => {
    // Create TwiML response
    const response = new VoiceResponse();

    response.say('Hi Luchen! Have fun at the hackathon.');
    // const gather = response.gather({
    //   input: 'speech dtmf',
    //   timeout: 3,
    //   numDigits: 1,
    // });
    //
    // console.log(gather);
    // gather.say('Please press 1 or say sales for sales.');

    // console.log(response.toString());

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(response.toString());
  })
  .listen(1337, '127.0.0.1');

console.log('TwiML server running at http://127.0.0.1:1337/');
