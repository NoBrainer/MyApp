
// Imports
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var express = require('express');
var fs = require('fs');
var http = require('http');
var https = require ('https');
var logger = require('morgan');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var path = require('path');
var serveStatic = require('serve-static');
var staticFavicon = require('static-favicon');

// Local imports
var config = require('./config');
var routes = require('./routes');
var user = require('./routes/user');
var fileUtil = require('./utils/file-util');

// Global variables
_ = require('./public/lib/underscore/js/underscore');

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
var port = process.env.PORT || config.props.HTTPS_PORT;
var publicDir = path.join(__dirname, 'public');
var prodPublicDir = path.join(__dirname, 'public-production');
app.set('env', config.props.ENV);
app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(staticFavicon());
app.use(bodyParser());
app.use(methodOverride());

// Do things when in development mode
var isDevelopment = 'development' === app.get('env');
if(isDevelopment){
	app.use(logger('dev'));
	app.use(errorHandler());
	app.use(serveStatic(publicDir));
	
	// Create aggregate template file
	var viewsDir = path.join(publicDir, 'js/views');
	var aggregateTemplateFile = path.join(publicDir, 'aggregate.template');
	fileUtil.aggregateTemplates(viewsDir, aggregateTemplateFile);
}else{
	app.use(serveStatic(prodPublicDir));
	
	// Create aggregate template file
	var viewsDir = path.join(publicDir, 'js/views');
	var aggregateTemplateFile = path.join(prodPublicDir, 'aggregate.template');
	fileUtil.aggregateTemplates(viewsDir, aggregateTemplateFile);
	
	// Create aggregate js file
	var jsDir = path.join(publicDir, 'js');
	var aggregateJsFile = path.join(prodPublicDir, 'js/aggregate.js');
	var libDir = path.join(publicDir, 'lib');
	fileUtil.aggregateJavaScript(jsDir, aggregateJsFile, libDir);
	
	// Create aggregate css file
	var aggregateCssFile = path.join(prodPublicDir, 'css/aggregate.css');
	fileUtil.aggregateCss(aggregateCssFile, publicDir);
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
var certOpts = {
		key : fs.readFileSync(config.props.KEY_PATH),
		cert : fs.readFileSync(config.props.CERT_PATH)
};
var server = https.createServer(certOpts, app);
server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

// Make separate server to reroute http to https
var httpApp = express();
var httpRouter = express.Router();
httpApp.use('*', httpRouter);
httpRouter.get('*', function(req, res){
	var host = req.get('Host');
	host = host.replace(/:\d+$/, ":"+app.get('port'));
	var destination = ['https://', host, req.url].join('');
	return res.redirect(destination);
});
var httpServer = http.createServer(httpApp);
httpServer.listen(config.props.HTTP_PORT);
