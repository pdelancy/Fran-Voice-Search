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
    console.log("line 11", dt);
    let day = dt.getDay();
    let dth = (dt.getHours() < 10) ? "0" + JSON.stringify(dt.getHours()) : JSON.stringify(dt.getHours());
    let dtm = (dt.getMinutes() < 10) ? "0" + JSON.stringify(dt.getMinutes()) : JSON.stringify(dt.getMinutes());
    let time = new Date([dth, dtm, "00"].join(":"));
    return places.map(p => {
        let sh = (parseInt(p.schedule[day].start.h, 10) < 10) ? "0" + p.schedule[day].start.h: p.schedule[day].start.h;
        let sm = (parseInt(p.schedule[day].start.minutes, 10) < 10) ? "0" + p.schedule[day].start.minutes: p.schedule[day].start.minutes;
        let eh = (parseInt(p.schedule[day].end.h, 10) < 10) ? "0" + p.schedule[day].end.h: p.schedule[day].end.h;
        let em = (parseInt(p.schedule[day].end.minutes, 10) < 10) ? "0" + p.schedule[day].end.minutes: p.schedule[day].end.minutes;
        let startTime = new Date([sh, sm, "00"].join(":"));
        let endTime = new Date([eh, em, "00"].join(":"));
        if(time.valueOf() >= startTime.valueOf() && time.valueOf() < endTime.valueOf()){
            console.log("line 24 return places value");
            return p;
        }
    });
};
exports.Frans = function Frans (req, res) {
    console.log("line 28");
    let response = "Hi Luchenn and Paul";
    console.log(req.body);
    let needs = req.body.result.parameters;
    console.log(needs);
    let type;
    let dateTime;
    let location;
    if(typeof needs.location === "String"){
        location = needs.location;
    } else {
        location = (needs.location["street-address"]) ? needs.location["street-address"] : Object.values(needs.location).join(", ");
    }
    console.log(location);
    intents.map(i => {
        if(req.body.result.metadata.intentName === i){
            type = i;
        }
    });
    console.log(type);
    console.log(needs.date);
    dateTime = (type === "Rehab" || type === "Shelter") ? new Date(needs.date) : new Date(needs.date + "T" + needs.time);
    console.log("line 40", dateTime);
    Place.find({
        type: type
    }).then(places => {
        console.log("line 44 in Place");
        let thePlace = timeAvailable(places, dateTime);
        console.log("the Place");
        let fromLocation = location + ", San Francisco, CA";
        Promise.all(thePlace.map(tp => {
            console.log("line 48 in promise all");
            let toLocation = tp.location.join("+");
            return axios.get(`http://open.mapquestapi.com/directions/v2/route?key=${process.env.MAPQUEST_KEY}` +
                    `&from=${fromLocation}&to=${toLocation}`)
                    .then(directions => {
                        console.log("");
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
                console.log("line 69 .then of Promise");
                return response.reduce((short, disdir) => {
                    if(disdir.distance < short.distance || short === null) {
                        return disdir;
                    } else {
                        return short;
                    }
                }, null);
            })
            .then(resp => {
                console.log("line 78",resp);
                res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
                res.send(JSON.stringify({ "speech": resp, "displayText": resp}));
            })
            .catch(e => {
                console.log(e);
            });
        res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
        res.send(JSON.stringify({ "speech": response, "displayText": response}));
    }).catch(e => {
        console.log("Mongo error :", e);
    });
};
