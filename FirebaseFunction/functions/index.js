const functions = require("firebase-functions");
const service = require("./service");

exports.compile = functions.https.onRequest(service.app);
