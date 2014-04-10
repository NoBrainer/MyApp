/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

// Mongo code
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/test_db');

var app = express();

// all environments
app.set('env', 'development');
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if('development' === app.get('env')){
	app.use(express.logger('dev'));
	app.use(express.errorHandler());
}

// routes
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/userlist', user.listFromMongo(db));
app.get('/newuser', user.newuser);
app.post('/adduser', user.adduser(db));

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
