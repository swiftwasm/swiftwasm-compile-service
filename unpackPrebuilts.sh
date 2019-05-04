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
