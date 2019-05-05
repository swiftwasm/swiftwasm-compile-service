#!/bin/bash
set -e
rm -r FirebaseFunction/functions/compiler FirebaseFunction/functions/service.js || true
cp service.js FirebaseFunction/functions/
cp -a compiler FirebaseFunction/functions/compiler
