const request = require('superagent');
const express = require('express');
const app = express();
const port = process.env.PORT || 8001;


// need to change the localhost to the url
const relayHost = process.env.RELAY_HOST || 'localhost';
const relayPort = process.env.RELAY_PORT || 8000;
const relayPath = process.env.RELAY_PATH || '/businesses';
const relayURL =
  `http://${relayHost}:${relayPort}${relayPath}`;

app.get('/', function (req, res) {
  request
    .get(relayURL)
    .end(function (err, relayRes) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(relayRes.body);
      }
    });
});

app.listen(port, function() {
  console.log("== Relaying", relayURL, "on port", port);
});
