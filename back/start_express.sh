#!/bin/sh
npm install
npm uninstall bcrypt
npm cache clean -f

npm install bcrypt -g
npm install bcrypt --save
npm update --save --save-dev
sleep 25
npm start
# node index.js