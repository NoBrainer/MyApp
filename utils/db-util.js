var bcrypt = require('bcrypt');
var fs = require('fs');
var mongoose = require('mongoose');

var User = require('../models/user-model');
var db = undefined;

/**
 * Setup the mongo database
 */
exports.setup = function setup(callback){
	// Setup the database
	var mongoOptions = {
//		user : config.props.MONGO_USERNAME,
//		pass : config.props.MONGO_PASSWORD,
		server : {
			auto_connect : false,
			poolSize : 50,
			socketOptions : {
				keepAlive : 1
			}/*,
			ssl : true,
			sslKey : fs.readFileSync(config.props.KEY_PATH),
			sslCert : fs.readFileSync(config.props.CERT_PATH)*/
		}
	};
	mongoose.connect(config.props.MONGO_LOCATION, mongoOptions);
	db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function(){
		console.log('successfully opened database!');
		
		if(_.isFunction(callback)){
			// Call this function if it's provided
			// Thi prevents a race condition where the server is listening before it's connected to mongo
			callback();
		}
	});
};

/**
 * Close the connection to mongo
 */
exports.close = function close(){
	db.close(function(){
		console.log('Mongoose disconnected');
	});
};
