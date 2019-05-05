#!/bin/bash
set -e
rm -r FirebaseFunction/functions/compiler FirebaseFunction/functions/service.js \
	FirebaseFunction/functions/extra_objs || true
cp service.js FirebaseFunction/functions/
cp -a compiler FirebaseFunction/functions/compiler
cp -a extra_objs FirebaseFunction/functions/extra_objs
bash generateModulemap.sh "/srv/functions/compiler/wasi-sdk/opt/wasi-sdk/share/sysroot" \
	>FirebaseFunction/functions/compiler/opt/swiftwasm-sdk/lib/swift/wasm/wasm32/glibc.modulemap
