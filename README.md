Compile microservice for the Try It Now feature on https://swiftwasm.org.

# Running

Tested on Ubuntu 18.04. The compilers fetched by ./downloadPrebuilts.sh are compiled for Ubuntu 16.04 and above.

```
./downloadPrebuilts.sh
./unpackPrebuilts.sh
npm install
node index.js
```

Then run

```
curl -d "{\"src\": \"print(1234)"}" -H "Content-Type: application/json" http://localhost:3000/v1/compile
```

# License

Apache 2.0.

Note that the compilers and libraries fetched by ./downloadPrebuilts.sh have different licenses.

# Code of Conduct

This project has adopted the [Contributor Covenant, version 1.4](https://www.contributor-covenant.org/version/1/4/code-of-conduct).
