
// Imports
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var express = require('express');
var http = require('http');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var morgan = require('morgan');//logger
var path = require('path');
var serveStatic = require('serve-static');
var staticFavicon = require('static-favicon');

// Local imports
var config = require('./config');
var routes = require('./routes');
var user = require('./routes/user');

// Setup the database
mongoose.connect(config.props.MONGO_LOCATION);
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
var port = process.env.PORT || config.props.PORT;
app.set('env', config.props.ENV);
app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(staticFavicon());
app.use(bodyParser());
app.use(methodOverride());
app.use(serveStatic(path.join(__dirname, 'public')));

// Do things when in development mode
if('development' === app.get('env')){
	app.use(morgan('dev'));
	app.use(errorHandler());
}

// Initialize the REST routes (TODO:use router.post where applicable)
var router = express.Router();
app.use('/api', router);
router.get('/', routes.index);
router.get('/user/create', user.create);
router.get('/user/exists', user.exists);
router.get('/user/getall', user.getAll);
router.get('/user/update', user.update);
router.get('/user/delete', user.delete);

// Start the server
var server = http.createServer(app);
server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
