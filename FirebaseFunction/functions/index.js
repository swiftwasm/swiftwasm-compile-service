const functions = require("firebase-functions");
const service = require("./service");

service.needsLibraryPath = true;

exports.compile = functions.https.onRequest(service.app);
