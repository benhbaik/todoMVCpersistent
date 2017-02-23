var express = require('express');
var app = express();
var routes = require('./app/routes.js');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var db = mongoose.connection;


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Method', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
    next();
});

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

mongoose.connect('mongodb://localhost:27017/dev');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to DB');
});

app.use('/todos', routes);

app.listen(3000, function() {
    console.log('Listening on port 3000');
});
