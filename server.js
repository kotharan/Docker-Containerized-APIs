const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const api = require('./api');

const app = express();
const port = process.env.PORT || 8000;
/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(express.static('public'));

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api);

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  });
});

app.listen(port, function() {
  console.log("== Server is running on port", port);
});



//---------------------------------------------------
//
// let p = new Promise((resolve, reject) => {
//   doAsyncOperation((err, results) => {
//     if (err) {
//       reject(err);
//     } else {
//       resolve(results);
//     }
//   });
// });
//
//
// function waitAndPrint(message) {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       if (message === "Error") {
//         reject(`We didn't like this string: "${message}"`);
//       } else {
//         console.log(message);
//         resolve();
//       }
//     }, 1000);
//   });
// }
//
// waitAndPrint("Patience is a virtue").then(() => {
//   console.log("... but I don't have the time.");
// }).catch((err) => {
//   console.log(`== Error: ${err}`);
// });
// waitAndPrint("Patience is a virtue", (err) => {
//   if (err) {
//     console.log(`== Error: ${err}`);
//   } else {
//     console.log("... but I don't have the time.");
//   }
// });
//
// waitAndPrint("3")
//   .then(() => { return waitAndPrint("2"); })
//   .then(() => { return waitAndPrint("1"); })
//   .then(() => { return waitAndPrint("...Blastoff!"); })
//   .catch((err) => { console.log(`== Error: ${err}`); });
//
//
