const fs = require("fs");
const fsPromises = fs.promises;
const childProcess = require("child_process");
const util = require("util");
const path = require("path");
const os = require("os");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const execFile = util.promisify(require('child_process').execFile);

const app = express();
app.use(bodyParser.json());
app.use(cors());

function execArg(appPath, arg) {
	if (exports.needsLibraryPath) {
		const env = {...process.env};
		env.LD_LIBRARY_PATH = path.join(appPath, "extralib");
		arg.env = env;
	}
	return arg;
}

async function compileOneFile(appPath, folder, sourcePath) {
	const outputPath = path.join(folder, "program.wasm");
	const sysRoot = path.join(appPath, "compiler/swift/usr/share/wasi-sysroot");
	var output = "";
	try {
		const compileOutput = await execFile(path.join(appPath, "compiler/swift/usr/bin/swiftc"), [
			"-target", "wasm32-unknown-unknown-wasi",
			"-sdk", sysRoot,
			"-o", outputPath,
			"-O", sourcePath], execArg(appPath, {
			"timeout": 4000,
			}));
		output = compileOutput.stderr;
	} catch (e) {
		output = e.stderr;
		return {success: false, output: output};
	}
	try {
		const stripOutput = await execFile(path.join(appPath, "compiler/wabt/wasm-strip"), [
			outputPath
			], {
			"timeout": 2000
			});
		output += stripOutput.stderr;
	} catch (e) {
		output += e.stderr;
		return {success: false, output: output};
	}
	return {success: true, output: output};
}

async function deleteDirectory(folder) {
	await execFile("rm", ["-r", folder], {"timeout": 2000});
}

function makeResponse(responseObj, data) {
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
	return outputBuffer;
}

async function handleCompile(req, res) {
	const reqObj = req.body;
	if (typeof(reqObj["src"]) != "string") {
		res.status(400).type("text/plain").send(makeResponse({"error": "Invalid request"}));
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
	res.status(200).type("text/plain").send(makeResponse(compileResult, outputFileBuffer));
}

app.post("/v1/compile", (req, res, next) => {
	handleCompile(req, res)
		.catch((e) => {
			next(e);
		});
});

exports.app = app;
