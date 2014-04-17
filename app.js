/**
 * Module dependencies.
 */

// Imports
var express = require('express');
var http = require('http');
var path = require('path');

// Local imports
var routes = require('./routes');
var user = require('./routes/user');

// Setup the database
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test_db'); //TODO: make this a property in a file ignored by git
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
//	console.log('successfully opened database!');
//	// Create schema
//	var userSchema = mongoose.Schema({
//		name: String,
//		email: String,
//		password: String,
//		type: String
//	});
//	
//	// Compile schema into a model
//	var User = mongoose.model('User', userSchema);
//	
//	// Create instance of a Kitten document
//	var vAdmin = new User({
//		name: "Vincent Incarvite",
//		email: "vinniemac189@gmail.com",
//		password: "password",
//		type: "admin"
//	});
//	
//	// Save it
//	vAdmin.save(function(err, savedObj){
//		if(err){
//			return console.error(err);
//		}
//		console.log("saved "+savedObj);
//	});
//	
//	// Searching
//	User.find(function(err, users){
//		if(err){
//			return console.error(err);
//		}
//		console.log(kittens);
//	});
});

// Setup the environment
var app = express();
app.set('env', 'development');
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Do things when in development mode
if('development' === app.get('env')){
	app.use(express.logger('dev'));
	app.use(express.errorHandler());
}

// Initialize the routes
app.get('/api', routes.index);
app.get('/user/create', user.create);
app.get('/user/exists', user.exists);
app.get('/user/getall', user.getAll);
app.get('/user/update', user.update);
app.get('/user/delete', user.delete);

// Start the server
var server = http.createServer(app);
server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
