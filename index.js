const fs = require("fs");
const fsPromises = fs.promises;
const childProcess = require("child_process");
const util = require("util");
const path = require("path");
const os = require("os");

const express = require("express");
const bodyParser = require("body-parser");

const execFile = util.promisify(require('child_process').execFile);

const app = express();
app.use(bodyParser.json());

const port = 3000;

async function compileOneFile(appPath, folder, sourcePath) {
	const objectPath = path.join(folder, "source.o");
	const outputPath = path.join(folder, "program.wasm");
	var output = "";
	try {
		const compileOutput = await execFile(path.join(appPath, "compiler/opt/swiftwasm-sdk/bin/swiftc"), [
			"-target", "wasm32-unknown-unknown-wasm",
			"-sdk", path.join(appPath, "compiler/wasi-sdk/opt/wasi-sdk/share/sysroot"),
			"-o", objectPath,
			"-O", "-c", sourcePath], {
			"timeout": 2000,
			});
		output = compileOutput.stderr;
	} catch (e) {
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
			"timeout": 2000
			});
		output += linkOutput.stderr;
	} catch (e) {
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
		output += e.stderr;
		return {success: false, output: output};
	}
	return {success: true, output: output};
}

async function deleteDirectory(folder) {
	await execFile("rm", ["-r", folder], {"timeout": 2000});
}

async function handleCompile(req, res) {
	const reqObj = req.body;
	if (typeof(reqObj["src"]) != "string") {
		res.status(400).send({"error": "Invalid request"});
		return;
	}
	const appPath = __dirname;
	const folder = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'swiftwasm-'));
	const sourcePath = path.join(folder, "source.swift");
	await fsPromises.writeFile(sourcePath, reqObj["src"]);
	const compileResult = await compileOneFile(appPath, folder, sourcePath);
	// todo: grab the link result
	await deleteDirectory(folder);
	res.status(200).send(compileResult);
}

app.post("/v1/compile", (req, res, next) => {
	handleCompile(req, res)
		.catch((e) => {
			next(e);
		});
});

app.listen(port);
