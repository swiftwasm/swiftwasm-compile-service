#!/bin/sh
exec sed -e "s@\"/include@\"$1/include@g" glibc.modulemap
