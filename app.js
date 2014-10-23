
//Create config.js at same level as this file with the following content:
//exports.props = {
//		MONGO_USERNAME : 'my_username',
//		MONGO_PASSWORD : 'my_password',
//		MONGO_LOCATION : 'mongodb://localhost:27017/test_db',
//		DATABASE : {
//			db : 'test_db',
//			host : 'localhost',
//			port : '27017'
//		}
//		KEY_PATH : '/location/to/key.pem',
//		CERT_PATH : '/location/to/cert.pem',
//		HOST : 'http://localhost:8080',
//		HTTP_PORT : 8080,
//		HTTPS_PORT : 8443,
//		ENV : 'development',
//		SECRET : 'random_string_of_chars',
//		APP_IP : '1.1.1.1',
//		APP_DOMAIN : 'mydomain.com',
//		EMAIL_OPTS : {
//			service : 'Gmail',
//			auth : {
//				user : 'username',
//				pass : 'password'
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
var logger = require('morgan');
var methodOverride = require('method-override');
var path = require('path');
var serveStatic = require('serve-static');
var session = require('express-session');
var staticFavicon = require('static-favicon');

// Global variables
_ = require('./public/lib/underscore/js/underscore');
config = require('./config');

// Local imports
var routes = require('./routes');
var user = require('./routes/user');
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
app.use(staticFavicon());
app.use(bodyParser());
app.use(methodOverride());

// Setup sessions
var MongoStore = require('connect-mongo')(session);
app.use(cookieParser());
app.use(session({
	secret : config.props.SECRET,
	maxAge : new Date(Date.now() + 3600000),
	store : new MongoStore(config.props.DATABASE)
}));

// TODO: figure out where to put this when things are more fleshed out
dbUtil.setup();

// Do things when in development mode
var isDevelopment = 'development' === app.get('env');
if(isDevelopment){
//	app.use(logger('dev'));
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

// Initialize the REST routes
var router = express.Router();
app.use('/api', router);
router.get('/', routes.index);
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
router.route('/users/:username')
	.get(user.exists);

// Start the server
console.log("Creating server...");
var server = http.createServer(app);

console.log("Listening to port "+app.get('port'));
server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

// If the node process ends, close the mongo connection
process
	.on('SIGINT', dbUtil.close)
	.on('SIGTERM', dbUtil.close)
	.on('exit', dbUtil.close);

//// Start the server
//var certOpts = {
//		key : fs.readFileSync(config.props.KEY_PATH),
//		cert : fs.readFileSync(config.props.CERT_PATH)
//};
//var server = https.createServer(certOpts, app);
//server.listen(app.get('port'), function(){
//	console.log('Express server listening on port ' + app.get('port'));
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
