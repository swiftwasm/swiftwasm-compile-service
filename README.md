Compile microservice for the Try It Now feature on https://swiftwasm.org.

# Running

Tested on Ubuntu 18.04. The compilers fetched by ./downloadPrebuilts.sh are compiled for Ubuntu 16.04 and above.

```
./downloadPrebuilts.sh
./unpackPrebuilts.sh
npm install
node local_server.js
```

Then run

```
curl -d "{\"src\": \"print(1234)\"}" -H "Content-Type: application/json" http://localhost:3000/v1/compile
```

# Deploying

This service can be deployed as a Firebase Function.

Instructions tested on macOS 10.14.4 with firebase-tools 6.8.0.

```
./downloadPrebuilts.sh
./unpackPrebuilts.sh
./copyFirebase.sh
cd FirebaseFunction
cd functions
npm install
cd ..
firebase deploy
```

# License

Apache 2.0.

Note that the compilers and libraries fetched by ./downloadPrebuilts.sh have different licenses.

# Code of Conduct

This project has adopted the [Contributor Covenant, version 1.4](https://www.contributor-covenant.org/version/1/4/code-of-conduct).
