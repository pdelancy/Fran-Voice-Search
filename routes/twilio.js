const twilio = require('twilio');
const VoiceResponse = twilio.TwimlResponse;
var express = require('express');
var router = express.Router();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
var apiai = require('apiai-promise');
var app = apiai(process.env.API_AI_TOKEN);
const axios = require('axios');
const { Place } = require('../models/models');
const intents = ["Food", "Shelter", "Medical", "Rehab", "Shower"];
let phoneNumber = "";

router.post('/receiveMessage', (req, res)=>{
  console.log('inside receive Message');
  // console.log('req', req.body.Body);
  const response = new VoiceResponse();
  let input = req.body.Body;
  app.textRequest(input, {
    sessionId: req.body.From
  }).then((response2)=>{
    if(!response2.result.actionIncomplete  && intents.indexOf(response2.result.metadata.intentName) !== -1){
      query(response2)
      .then((place) => {
        console.log("*************\n", place);
        if(!place){
          response.sms("I am sorry, there is no available service at this time.")
        } else {
          response.sms(`I found ${place.name} at ${place.location}`);
          const textString = place.direction.join("\n")
          console.log(textString);
          place.direction.map((instruction) => {
            response.sms(instruction);
          });
        }
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(response.toString());
      })
    } else {
      let newResponse = response2.result.fulfillment.speech;
      // console.log(newResponse);
      // console.log(response);
      response.sms(newResponse);
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(response.toString());
    }
  })
  .catch((err)=>{
    console.log(err);
  })
})

router.post('/receiveCall', (req, res) => {
  // console.log(req);
  const response = new VoiceResponse();
  let completed = false;
  let newResponse;
  console.log(req.body);
  if( req.body.Digits ){
    console.log(req.body.Digits);
    if(req.body.Digits === '1'){
      response.dial(phoneNumber);
    } else if(req.body.Digits === '2'){
      response.dial("301-873-0062");
    }
    phoneNumber = "";
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(response.toString());
  } else if(req.body.SpeechResult){
    let input = req.body.SpeechResult;
    // console.log(input);
    let dialogFlowResponded = false;
    //call dialogflow
    // console.log("in conversation");
    // console.log(req.body.From);
    app.textRequest(input, {
        sessionId: req.body.From
    }).then((response2) => {
      let newResponse = response2.result.fulfillment.speech;
      // console.log(response);
      // console.log(newResponse);
      let completed = !response2.result.actionIncomplete;
      dialogFlowResponded = true;
      response.say( JSON.stringify(newResponse));
      if(!completed || intents.indexOf(response2.result.metadata.intentName) === -1){
        const gather = response.gather({
          input: 'speech dtmf',
          timeout: 5
          // action: '/readText',
          // method: 'GET'
          // numDigits: 1,
        });
        return;
      } else {
        // console.log(response2.result);
        return query(response2)
        .then((place) => {
          // console.log("*************\n", place);
          if(!place){
            response.say("I am sorry, the service you are looking for is probably not yet in our database. It will be soon");
          } else {
            response.say(`I found ${place.name} at ${place.location}`);
            const textString = place.direction.join("\n")
            // console.log(textString);
            place.direction.map((instruction) => {
              response.sms(instruction);
            })
            if(place.phoneNumber){
              phoneNumber = place.phoneNumber;
              response.say(`This service has a hotline, would you like me to connect you? To connect, press 1. To call Paul, press 2. To end the call, press 3.`);
              const gather = response.gather({
                input: 'dtmf',
                timeout: 5,
                // action: '/readText',
                // method: 'GET'
                numDigits: 1,
              });
            }
          }
          // response.dial('614-531-7501');
          return;
        })
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

let timeAvailable = (places, dt) => {
    // console.log("line 11", dt);
    let day = dt.getDay();
    // console.log(96, day);
    let dth = (dt.getHours() < 10) ? "0" + JSON.stringify(dt.getHours()) : JSON.stringify(dt.getHours());
    let dtm = (dt.getMinutes() < 10) ? "0" + JSON.stringify(dt.getMinutes()) : JSON.stringify(dt.getMinutes());
    let desiredTime = new Date();
    desiredTime.setHours(parseInt(dth));
    desiredTime.setMinutes(parseInt(dtm));
    desiredTime.setSeconds(0);
    var things = places.map(p => {
        if(p.schedule[day]) {
          var validTime = p.schedule[day].reduce((foundPlace, time) => {
            if(!foundPlace){
              console.log('searching');
              let sh = (parseInt(time.start.h, 10) < 10) ? "0" + time.start.h: time.start.h;
              let sm = (parseInt(time.start.minutes, 10) < 10) ? "0" + time.start.minutes: time.start.minutes;
              let eh = (parseInt(time.end.h, 10) < 10) ? "0" + time.end.h: time.end.h;
              let em = (parseInt(time.end.minutes, 10) < 10) ? "0" + time.end.minutes: time.end.minutes;
              let startTime = new Date();
              startTime.setHours(parseInt(sh));
              startTime.setMinutes(parseInt(sm));
              startTime.setSeconds(0);
              let endTime = new Date();
              endTime.setHours(parseInt(eh));
              endTime.setMinutes(parseInt(em));
              endTime.setSeconds(0);
              console.log(startTime, endTime, desiredTime);
              if(desiredTime.valueOf() >= startTime.valueOf() && desiredTime.valueOf() < endTime.valueOf()){
                  console.log("line 24 return places value");
                  return p;
              }
            } else {
              return foundPlace;
            }
          }, null)
          if(validTime) console.log("WEEEE FOUND A VALID TIME");
          return validTime;
        }
    }).filter( place => place );
    //console.log("Line 121", things);
    return things
};
const query = (body) => {
    //console.log("line 28");
    let response = "Hi Luchenn and Paul";
    let params = body.result.parameters;
    //console.log(body);
    let type;
    let dateTime;
    let location;
    if(typeof params.location === "string"){
        location = params.location;
    }
    // else {
    //     location = (params.location["street-address"]) ? params.location["street-address"] : Object.values(params.location).join(", ");
    // }
    //console.log(location);
    intents.map(i => {
        if(body.result.metadata.intentName === i){
            type = i;
        }
    });
    //console.log(type);
    //console.log(params.date);
    dateTime = (type === "Rehab" || type === "Shelter") ? new Date(params.date) : new Date(params.date + "T" + params.time);
    //console.log("line 40", dateTime);
    // if(!location) return {smallTalk: true};
    return Place.find({
        type: type
    }).then(places => {
        //console.log("line 44 in Place", places);
        let thePlace = timeAvailable(places, dateTime);
        //console.log("the Place", thePlace);
        let fromLocation = location + ", SanFrancisco, CA";
        // fromLocation = fromLocation.split(" ").join("+");
        return Promise.all(thePlace.map(tp => {
            //console.log("line 48 in promise all");
            //console.log(tp);
            let toLocation = tp.location.split(" ").join("+");
            //console.log(toLocation);
            return axios.get(`http://www.mapquestapi.com/directions/v2/route?key=${process.env.MAPQUEST_KEY}` +
                    `&from=${fromLocation}&to=${toLocation}`)
                    .then(directions => {
                      //console.log(directions.data.route);
                        let dir = {
                            distance: parseFloat(directions.data.route.distance),
                            direction: directions.data.route.legs[0].maneuvers.map(maneuver => {
                              //console.log(maneuver);
                                return maneuver.narrative;
                            }),
                            name: tp.name,
                            phoneNumber: tp.phoneNumber,
                            location: tp.location
                        };
                        //console.log(dir);
                        return dir;
                    })
                    .catch(e => {
                        console.log("Getting directions failed: ", e);
                    });
            }))
            .then((r) => {
                //console.log("line 69 .then of Promise");
                //console.log(r);
                return r.reduce((short, disdir) => {
                    if(short === null || disdir.distance < short.distance ) {
                        return disdir;
                    } else {
                        return short;
                    }
                }, null);
            })
            .then(resp => {
                //console.log("line 78",resp);
                return resp;
            })
            .catch(e => {
                console.log(e);
            });
    }).catch(e => {
        console.log("Mongo error :", e);
    });
};

module.exports = router;
