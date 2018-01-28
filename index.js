/*
* HTTP Cloud Function.
*
* @param {Object} req Cloud Function request context.
* @param {Object} res Cloud Function response context.
*/

exports.Frans = function Frans (req, res) {
  response = "This is a sample response from your webhook!" //Default response from the webhook to show it's working
  res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
  res.send(JSON.stringify({ "speech": response, "displayText": response}));
};