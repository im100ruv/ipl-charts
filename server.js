const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const matchRoute = require('./routes/match');
const playerRoute = require('./routes/player');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/iplstats');

mongoose.connection.once('open', function(){
  console.log('connected to mongodb...');
}).on('error', function(error){
  console.log("connection error: ",error);
});

// type this in mongo shell
// $ mongoimport -d iplstats -c matches --type csv --file /home/dev/Downloads/csv/matches.csv --headerline

let server = express();

server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(express.static('public'));
server.use('/match', matchRoute);
server.use('/player', playerRoute);

server.get('/', function(req, res){
  res.sendFile(path.join(__dirname + '/index.html'));
})

server.listen(8082, function(){
  console.log("server is listening at: http://localhost:8082 ")
});
