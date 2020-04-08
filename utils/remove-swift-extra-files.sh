#!/bin/sh
source="$(cd "$(dirname $0)/.." && pwd)"
basepath="$source/prebuilt/linux/swift/usr"
filestoremove="bin/sil-* 
bin/lldb*
bin/*lld*
bin/clang-tidy
bin/clang++
bin/clang-cpp
bin/clang-10
bin/clang-cl
bin/sourcekitd-*
bin/swift-build
bin/swift-run
bin/swift-test
bin/swift-api-digester
bin/swift-ast-script
bin/swift-autolink-extract
bin/swift-demangle
bin/swift-demangle-yamldump
bin/swift-format
bin/swift-indent
bin/swift-llvm-opt
bin/swift-refactor
bin/swift-reflection-dump
bin/swift-symbolgraph-extract
bin/swift-*-test
bin/llvm*
bin/llc
lib/libsourcekitdInProc.so
lib/swift_static/linux/*
lib/swift"
for i in $filestoremove
do
	echo $basepath/$i
	rm -rf $basepath/$i
done
