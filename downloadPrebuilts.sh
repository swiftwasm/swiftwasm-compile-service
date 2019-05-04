#!/bin/bash
set -e
rm -r prebuilt || true
mkdir prebuilt
cd prebuilt
wget https://github.com/swiftwasm/swiftwasm-sdk/releases/download/20190503.1/swiftwasm.tar.gz
wget https://github.com/swiftwasm/wasi-sdk/releases/download/20190421.6/wasi-sdk-3.19gefb17cb478f9.m-linux.tar.gz
wget https://github.com/swiftwasm/icu4c-wasi/releases/download/20190421.3/icu4c-wasi.tar.xz
