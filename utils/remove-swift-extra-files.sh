#!/bin/sh
source="$(cd "$(dirname $0)/.." && pwd)"
basepath="$source/prebuilt/linux/swift/usr"
filestoremove="bin/sil-* 
bin/lldb*
bin/sourcekitd-*
bin/swift-api-digester
bin/swift-autolink-extract
bin/swift-demangle
bin/swift-demangle-yamldump
bin/swift-format
bin/swift-llvm-opt
bin/swift-refactor
bin/swift-reflection-dump
bin/swift-*-test
bin/llvm*
bin/llc
lib/libsourcekitdInProc.so
lib/swift/clang/lib/linux/*
lib/swift_static/linux/*
lib/swift/linux/x86_64/*
lib/swift/linux/*"
for i in $filestoremove
do
	echo $basepath/$i
	rm -rf $basepath/$i
done
