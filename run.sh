#!/bin/bash
rval=1
while ((rval == 1)); do
    npm run build:js
    npm start
    rval=$?
    echo "$rval"
    if test -f "./updateNow";
    then
        rm ./updateNow
        npm run update
        rval=1
    fi
sleep 1
done
