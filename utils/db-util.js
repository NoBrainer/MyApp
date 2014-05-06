var bcrypt = require('bcrypt');
var fs = require('fs');
var mongoose = require('mongoose');

var User = require('../models/user-model');
var db = undefined;

/**
 * Setup the mongo database
 */
exports.setup = function(){
	// Setup the database
	var mongoOptions = {
//		user : config.props.MONGO_USERNAME,
//		pass : config.props.MONGO_PASSWORD,
		replset : {
			auto_connect : false,
			poolSize : 10,
			socketOptions : {
				keepAlive : 1
			},
			ssl : true,
			sslKey : fs.readFileSync(config.props.KEY_PATH),
			sslCert : fs.readFileSync(config.props.CERT_PATH)
		}
	};
	mongoose.connect(config.props.MONGO_LOCATION, mongoOptions);
	db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function(){
		console.log('successfully opened database!');
		
		// Create instance of a User
//		var adminUser = new User({
//			username : "email_address@gmail.com",
//			password : "password",
//			type : "admin",
//			name : "Bob Marley"
//		});
//		
//		// Save it
//		adminUser.save(function(err, savedObj){
//			if(err){
//				return console.error(err);
//			}
//			console.log("saved "+savedObj);
//		});
		
//		var searchCriteria = {
//				username: "email_address@gmail.com"
//		};
//		var testPassword = "password";
//		
//		// Search for a single user based on username
//		User.findOne(searchCriteria, function(err, user){
//			if(err) throw err;
//			
//			// Test password matching
//			user.comparePassword(testPassword, function(err, isMatch){
//				if(err) throw err;
//				
//				console.log("Password match?", isMatch);
//			});
//		});
		
		// http://blog.mongodb.org/post/32866457221/password-authentication-with-mongoose-part-1
	});
};
