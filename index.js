/*
* HTTP Cloud Function.
*
* @param {Object} req Cloud Function request context.
* @param {Object} res Cloud Function response context.
*/
const axios = require('axios');
const { Place } = require('./models/models');
const intents = ["Food", "Shelter", "Medical", "Rehab", "Shower"];
let timeAvailable = (places, dt) => {
    let day = dt.getDay();
    let dth = (dt.getHours() < 10) ? "0" + JSON.stringify(dt.getHours()) : JSON.stringify(dt.getHours());
    let dtm = (dt.getMinutes() < 10) ? "0" + JSON.stringify(dt.getMinutes()) : JSON.stringify(dt.getMinutes());
    let time = new Date([dth, dtm, "00"].join(:));
    return places.map(p => {
        let sh = (parseInt(p.schedule[day].start.h, 10) < 10) ? "0" + p.schedule[day].start.h: p.schedule[day].start.h;
        let sm = (parseInt(p.schedule[day].start.minutes, 10) < 10) ? "0" + p.schedule[day].start.minutes: p.schedule[day].start.minutes;
        let eh = (parseInt(p.schedule[day].end.h, 10) < 10) ? "0" + p.schedule[day].end.h: p.schedule[day].end.h;
        let em = (parseInt(p.schedule[day].end.minutes, 10) < 10) ? "0" + p.schedule[day].end.minutes: p.schedule[day].end.minutes;
        let startTime = new Date([sh, sm, "00"].join(":"));
        let endTime = new Date([eh, em, "00"].join(":"));
        if(time >= startTime && time < endTime){
            return p;
        }
    });
};
exports.Frans = function Frans (req, res) {
    console.log("in Frans");
    let response;
    let needs = req.body.result.parameters;
    let type;
    let dateTime;
    let location = needs.location.street-address;
    intents.map(i => {
        if(req.body.result.metadata.intentName === i){
            type = i;
        }
    });
    dateTime = (type === "Rehab" || type === "Shelter") ? new Date(needs.date) : new Date(needs.date + "T" + needs.time);
    Place.find({
        type: type
    }).then(places => {
        let thePlace = timeAvailable(places, dateTime);
        let fromLocation = location + ", San Francisco, CA";
        Promise.all(thePlace.map(tp => {
            let toLocation = tp.location.join("+");
            return axios.get(`http://open.mapquestapi.com/directions/v2/route?key=${process.env.MAPQUEST_KEY}` +
                    `&from=${fromLocation}&to=${toLocation}`)
                    .then(directions => {
                        response.push({
                            distance: parseDouble(directions.route.distance),
                            direction: directions.route.legs[0].maneuvers.map(maneuver => {
                                return maneuver.narratives;
                            }).join("\n")
                        });
                    })
                    .catch(e => {
                        console.log("Getting directions failed: ", e);
                    });
            }))
            .then(() => {
                return response.reduce((short, disdir) => {
                    if(disdir.distance < short.distance || short === null) {
                        return disdir;
                    } else {
                        return short;
                    }
                }, null);
            })
            .then(resp => {
                console.log(resp);
                res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
                res.send(JSON.stringify({ "speech": resp, "displayText": resp}));
            })
            .catch(e => {
                console.log(e);
            });
        })
    }).catch(e => {
        console.log("Mongo error :", e);
    });
};
