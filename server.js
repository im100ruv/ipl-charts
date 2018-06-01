const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

let server = express();

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }))

server.get('/', function(req, res){
  res.sendFile(path.join(__dirname + '/index.html'));
})

server.listen(8082, function(){
  console.log("server is listening...")
});