require('babel-register');
const express = require('express');
const initStream = require('./lib/tweets');

var app = express();

app.get('/', function (req, res) {
  res.send('Hello 🌭!')
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});

initStream();
