const functions = require("firebase-functions");
const service = require("./service");

service.needsLibraryPath = true;

exports.compile = functions
	.runWith({memory: '2GB'})
	.https.onRequest(service.app);
