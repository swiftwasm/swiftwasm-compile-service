#!/bin/bash
set -e
rm -r FirebaseFunction/functions/compiler FirebaseFunction/functions/service.js || true
cp service.js FirebaseFunction/functions/
cp -r compiler FirebaseFunction/functions/compiler
