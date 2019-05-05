#!/bin/bash
set -e
rm -r FirebaseFunction/functions/compiler FirebaseFunction/functions/service.js \
	FirebaseFunction/functions/extra_objs || true
cp service.js FirebaseFunction/functions/
cp -a compiler FirebaseFunction/functions/compiler
cp -a extra_objs FirebaseFunction/functions/extra_objs
