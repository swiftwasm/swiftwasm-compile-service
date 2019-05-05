#!/bin/bash
set -e
rm -r compiler || true
mkdir compiler
cd compiler
for i in ../prebuilt/*
do
	tar xf $i
done
cd ..
mv "compiler/wasi-sdk-"* "compiler/wasi-sdk"
mv "compiler/wabt-"* "compiler/wabt"
bash remove-swift-extra-files.sh || true
bash remove-wasi-extra-files.sh || true
bash remove-wabt-extra-files.sh || true
mkdir compiler/extralib
cp libatomic.so.1 compiler/extralib/
cp compiler/opt/swiftwasm-sdk/lib/swift/wasm/wasm32/glibc.modulemap ./
bash generateModulemap.sh "$PWD/compiler/wasi-sdk/opt/wasi-sdk/share/sysroot" >compiler/opt/swiftwasm-sdk/lib/swift/wasm/wasm32/glibc.modulemap
