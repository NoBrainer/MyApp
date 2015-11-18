
//Create config.js at same level as this file with the following content:
//exports.props = {
//		ENV : 'dev', //dev|prod
//		APP_IP : '1.1.1.1', //#.#.#.#|localhost
//		APP_DOMAIN : 'mydomain.com',
//		URL_ROOT : 'http://localhost:8080',
//		HTTP_PORT : 8080,
//		HTTPS_PORT : 8443,
//		
//		// Database
//		MONGO_USERNAME : 'username12345',
//		MONGO_PASSWORD : 'password12345',
//		MONGO_LOCATION : 'mongodb://localhost:27017/test_db',
//		DATABASE : {
//			db : 'test_db',
//			host : 'localhost',
//			port : '27017'
//		},
//		
//		// Encryption
//		KEY_PATH : '/path/to/key.pem',
//		CERT_PATH : '/path/to/cert.pem',
//		SECRET : 'random_string_of_chars',
//		
//		// Email
//		EMAIL_OPTS : {
//			service : 'Gmail',
//			auth : {
//				user : 'username12345',
//				pass : 'password12345'
//			}
//		}
//};

// Imports
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var express = require('express');
var fs = require('fs');
var http = require('http');
var https = require ('https');
var morganLogger = require('morgan');
var methodOverride = require('method-override');
var path = require('path');
var serveStatic = require('serve-static');
var session = require('express-session');
var favicon = require('serve-favicon');


//Compress png/jpg files TODO: hook this into a runtime arg
var Imagemin = require('imagemin');
var compressResources = false,
	compressMenus = false;
if(compressResources){
	new Imagemin()
		.src('public/resources/*.png')
		.dest('public-production/resources')
		.use(Imagemin.optipng({optimizationLevel: 3}))
		.run(function(err, files){
			console.log(err);
		});
	new Imagemin()
		.src('public/resources/*.jpg')
		.dest('public-production/resources')
		.use(Imagemin.jpegtran({progressive: true}))
		.run(function(err, files){
			console.log(err);
		});
}
if(compressMenus){
	new Imagemin()
		.src('public/resources/menus/*.png')
		.dest('public-production/resources/menus')
		.use(Imagemin.optipng({optimizationLevel: 3}))
		.run(function(err, files){
			console.log("png...");
			console.log(err);
		});
	new Imagemin()
		.src('public/resources/menus/*.jpg')
		.dest('public-production/resources/menus')
		.use(Imagemin.jpegtran({progressive: true}))
		.run(function(err, files){
			console.log("jpg...");
			console.log(err);
		});
}

// Global variables
_ = require('./public/lib/underscore/js/underscore');
logger = require('./utils/logger-util');
try{
	// First try to use the config file in the properties directory
	config = require('../properties/config');
}catch(e){
	// Fallback to the config file with the app
	config =  require('./config')
}

// Local imports
var routes = require('./routes');
var user = require('./routes/user');
var news = require('./routes/news');
var schedule = require('./routes/schedule');
var fileUtil = require('./utils/file-util');
var dbUtil = require('./utils/db-util');

// Setup the environment
var app = express();
var port = config.props.HTTP_PORT;//TODO: finalize a port
var publicDir = path.join(__dirname, 'public');
var prodPublicDir = path.join(__dirname, 'public-production');
app.set('env', config.props.ENV);
app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser());
app.use(methodOverride());

// Setup sessions
var MongoStore = require('connect-mongo')(session);
app.use(cookieParser());
app.use(session({
	secret : config.props.SECRET,
	cookie : {
		maxAge : 86400000
	},
	store : new MongoStore(config.props.DATABASE)
}));

// Do things when in development mode
var isDevelopment = ('dev' === app.get('env'));
if(isDevelopment){
//	app.use(morganLogger('dev'));
	app.use(favicon(path.join(publicDir, 'logo.ico')));
	app.use(errorHandler());
	app.use(serveStatic(publicDir));
	
	// Create aggregate template file
	var viewsDir = path.join(publicDir, 'js/views');
	var aggregateTemplateFile = path.join(publicDir, 'aggregate.template');
	fileUtil.aggregateTemplates(viewsDir, aggregateTemplateFile);
}else{
	app.use(serveStatic(prodPublicDir));
	app.use(favicon(path.join(prodPublicDir, 'logo.ico')));
	
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
	
	//TODO: finish
//	// Copy over the resources directory
//	var resourceDir = path.join(publicDir, 'resources');
//	var prodResourceDir = path.join(prodPublicDir, 'resources');
//	var preserveNesting = true;
//	fileUtil.copyDirectory(resourceDir, prodResourceDir, preserveNesting);
}

// Initialize the REST routes
var router = express.Router();
app.use('/api', router);
router.get('/', routes.index);
// Users
router.route('/users')
	.get(user.getAll);
router.route('/users/login')
	.get(user.isLoggedIn)
	.post(user.login);
router.route('/users/logout')
	.post(user.logout);
router.route('/users/register')
	.post(user.register);
router.route('/users/confirmation/:id')
	.get(user.confirmation);
router.route('/users/approve')
	.post(user.approveUser);
router.route('/users/update')
	.post(user.updateUser);
router.route('/users/updateType')
	.post(user.updateUserType);
router.route('/users/startPasswordReset')
	.post(user.startPasswordReset);
router.route('/users/resetPassword')
	.get(user.isAbleToResetPassword)
	.post(user.resetPassword);
router.route('/users/:username') //TODO: investigate if this is needed
	.get(user.exists);
// News
router.route('/news')
	.get(news.getAll);
router.route('/news/create')
	.post(news.create);
router.route('/news/update')
	.post(news.update);
router.route('/news/remove')
	.post(news.remove);
// Schedule
router.route('/schedule')
	.get(schedule.getAll);
router.route('/schedule/range')
	.get(schedule.getRange);
router.route('/schedule/month')
	.get(schedule.getMonth);
router.route('/schedule/update')
	.post(schedule.update);

var startListening = function startListening(){
	// Start the server
	logger.log("Creating server...");
	var server = http.createServer(app);
	
	logger.log("Listening to port "+app.get('port'));
	server.listen(app.get('port'), function(){
		logger.log('Express server listening on port ' + app.get('port'));
	});
	
	// If the node process ends, close the mongo connection
	process
		.on('SIGINT SIGTERM SIGKILL', dbUtil.close)
		.on('exit', dbUtil.close);
}

// Setup the database then have the server start listening
dbUtil.setup(function(){
	// Make sure to have the server start listening after it's connected to mongo
	startListening();
});

//// Start the server
//var certOpts = {
//		key : fs.readFileSync(config.props.KEY_PATH),
//		cert : fs.readFileSync(config.props.CERT_PATH)
//};
//var server = https.createServer(certOpts, app);
//server.listen(app.get('port'), function(){
//	logger.log('Express server listening on port ' + app.get('port'));
//});
//
//// Make separate server to reroute http to https
//var httpApp = express();
//var httpRouter = express.Router();
//httpApp.use('*', httpRouter);
//httpRouter.get('*', function(req, res){
//	var host = req.get('Host');
//	host = host.replace(/:\d+$/, ":"+app.get('port'));
//	var destination = ['https://', host, req.url].join('');
//	return res.redirect(destination);
//});
//var httpServer = http.createServer(httpApp);
//httpServer.listen(config.props.HTTP_PORT);
