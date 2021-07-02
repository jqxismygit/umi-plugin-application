#!/bin/sh

PWD=`pwd`

TS_CONFIG="$PWD/tsconfig.json"

TS_CONFIG_LIB="$PWD/lib/tsconfig.json"

father-build
cp $TS_CONFIG $TS_CONFIG_LIB