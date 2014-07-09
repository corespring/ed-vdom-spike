
var fs = require('fs');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');

app = express();

app.use('/', express.static("" + __dirname));

port = process.env.PORT || 5000;
app.set('port', port);

handler = function() {
  return console.log("Express server listening on port " + port);
};

http.createServer(app).listen(app.get('port'), handler);