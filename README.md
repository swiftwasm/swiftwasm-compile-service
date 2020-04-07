Compile microservice for the Try It Now feature on https://swiftwasm.org.

## Running

```
npm install
make prebuilt/wabt prebuilt/swift
node local_server.js
```

Then run

```
curl -d "{\"src\": \"print(1234)\"}" -H "Content-Type: application/json" http://localhost:3000/v1/compile
```

## Deploying

This service can be deployed as a Firebase Function.

Instructions tested on macOS 10.15.3 with firebase-tools 8.0.2.

```sh
$ brew install rpm2cpio
$ npm install firebase-tools -g
```

```
make deploy
cd FirebaseFunction/functions
npm install
cd ..
firebase deploy
```

# License

Apache 2.0.

Note that the compilers and libraries fetched by ./downloadPrebuilts.sh have different licenses.

# Code of Conduct

This project has adopted the [Contributor Covenant, version 1.4](https://www.contributor-covenant.org/version/1/4/code-of-conduct).
