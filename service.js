const fs = require("fs");
const fsPromises = fs.promises;
const childProcess = require("child_process");
const util = require("util");
const path = require("path");
const os = require("os");
const zlib = require("zlib");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const execFile = util.promisify(require('child_process').execFile);
const gzip = util.promisify(zlib.gzip);

const app = express();
app.use(bodyParser.json());
app.use(cors());

function execArg(appPath, arg) {
	if (exports.needsLibraryPath) {
		const env = {...process.env};
		env.LD_LIBRARY_PATH = path.join(appPath, "compiler/extralib");
		arg.env = env;
	}
	return arg;
}

async function compileOneFile(appPath, folder, sourcePath) {
	const objectPath = path.join(folder, "source.o");
	const outputPath = path.join(folder, "program.wasm");
	var output = "";
	try {
		const compileOutput = await execFile(path.join(appPath, "compiler/opt/swiftwasm-sdk/bin/swiftc"), [
			"-target", "wasm32-unknown-unknown-wasm",
			"-sdk", path.join(appPath, "compiler/wasi-sdk/opt/wasi-sdk/share/sysroot"),
			"-o", objectPath,
			"-O", "-c", sourcePath], execArg(appPath, {
			"timeout": 4000,
			}));
		output = compileOutput.stderr;
	} catch (e) {
		console.log(e);
		output = e.stderr;
		return {success: false, output: output};
	}
	const sysRoot = path.join(appPath, "compiler/wasi-sdk/opt/wasi-sdk/share/sysroot");
	const swiftPath = path.join(appPath, "compiler/opt/swiftwasm-sdk");
	try {
		const linkOutput = await execFile(path.join(appPath, "compiler/wasi-sdk/opt/wasi-sdk/bin/wasm-ld"), [
			"--error-limit=0", "-o", outputPath,
			// start objects
			path.join(sysRoot, "lib/wasm32-wasi/crt1.o"),
			path.join(appPath, "extra_objs/swift_start.o"),
			path.join(swiftPath, "lib/swift_static/wasm/wasm32/swiftrt.o"),
			// newly compiled object
			objectPath,
			// linking static libraries
			"-L" + path.join(swiftPath, "lib/swift_static/wasm"),
			"-L" + path.join(sysRoot, "lib/wasm32-wasi"),
			"-L" + path.join(appPath, "compiler/icu_out/lib"),
			"-lswiftCore",
			"-lc", "-lc++", "-lc++abi", "-lswiftImageInspectionShared",
			"-licuuc", "-licudata",
			path.join(appPath, "compiler/wasi-sdk/opt/wasi-sdk/lib/clang/8.0.0/lib/wasi/libclang_rt.builtins-wasm32.a"),
			path.join(appPath, "extra_objs/fakepthread.o"),
			path.join(appPath, "extra_objs/fakelocaltime.o"),
			// end object
			path.join(appPath, "extra_objs/swift_end.o"),
			// keep all metadata
			"--no-gc-sections",
			// sometimes threads hangs
			"--no-threads"
			], {
			"timeout": 4000
			});
		output += linkOutput.stderr;
	} catch (e) {
		console.log(e);
		output += e.stderr;
		return {success: false, output: output};
	}
	try {
		const stripOutput = await execFile(path.join(appPath, "compiler/wabt/wasm-strip"), [
			objectPath
			], {
			"timeout": 2000
			});
		output += stripOutput.stderr;
	} catch (e) {
		console.log(e);
		output += e.stderr;
		return {success: false, output: output};
	}
	return {success: true, output: output};
}

async function deleteDirectory(folder) {
	await execFile("rm", ["-r", folder], {"timeout": 2000});
}

async function makeResponse(responseObj, data) {
	// format:
	// magic:UInt32LE = 0xdec0ded0
	// lengthJson:UInt32LE
	// json string
	// wasm begins here
	const dataLength = data? data.length: 0;
	const responseObjStr = JSON.stringify(responseObj);
	const responseObjBuffer = Buffer.from(responseObjStr, "utf-8");
	const outputBuffer = Buffer.allocUnsafe(4 + 4 + responseObjBuffer.length + dataLength);
	outputBuffer.writeUInt32LE(0xdec0ded0, 0);
	outputBuffer.writeUInt32LE(responseObjBuffer.length, 4);
	responseObjBuffer.copy(outputBuffer, 8);
	if (data) {
		data.copy(outputBuffer, 8 + responseObjBuffer.length);
	}
	return await gzip(outputBuffer);
}

async function handleCompile(req, res) {
	const reqObj = req.body;
	if (typeof(reqObj["src"]) != "string") {
		res.status(400).send("Invalid request");
		return;
	}
	const appPath = __dirname;
	const folder = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'swiftwasm-'));
	const sourcePath = path.join(folder, "source.swift");
	await fsPromises.writeFile(sourcePath, reqObj["src"]);
	const compileResult = await compileOneFile(appPath, folder, sourcePath);
	let outputFileBuffer = null;
	if (compileResult.success) {
		outputFileBuffer = await fsPromises.readFile(path.join(folder, "program.wasm"));
	}
	await deleteDirectory(folder);
	const responseData = await makeResponse(compileResult, outputFileBuffer);
	res.status(200).send(responseData);
}

app.post("/v1/compile", (req, res, next) => {
	handleCompile(req, res)
		.catch((e) => {
			next(e);
		});
});

exports.app = app;
