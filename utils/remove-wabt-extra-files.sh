#!/bin/sh
basepath="$1"
filestoremove="spectest-interp wasm2c wasm2wat wasm-interp wasm-objdump wasm-opcodecnt wasm-validate wast2json wat2wasm wat-desugar"
for i in $filestoremove
do
	echo $basepath/$i
	rm -f $basepath/$i
done
