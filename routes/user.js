var mongoose = require('mongoose');
var User = require('../models/user-model');


/**
 * POST - Create new user
 */
exports.create = function(req, res){
	//TODO: validate req.body
	
	var body = req.body;
	
	// Default response template
	var responseObject = {
		error : null,
		saved : false
	};
	
	// Create instance of a User
	var currentUser = new User({
		username : body.username,
		password : body.password,
		type : body.type || "default",
		name : body.name || ""
	});
	
	// Save it
	currentUser.save(function(err, savedObj){
		if(err){
			responseObject.error = err;
			console.error(err);
		}else{
			responseObject.saved = true;
		}
		res.send(responseObject);
	});
};

/**
 * GET - Check if a user exists
 */
exports.exists = function(req, res){
	//TODO: validate req.params
	
	var username = req.params.username;
	
	// Default response template
	var responseObject = {
		error : null,
		found : false
	};
	
	// Search for a single user based on username
	var query = {
		username : username
	};
	User.findOne(query, function(err, user){
		if(err){
			responseObject.error = err;
			console.error(err);
		}else{
			responseObject.found = true;
		}
		res.send(responseObject);
	});
};

/**
 * GET - A list of all users
 */
exports.getAll = function(req, res){
	// Default response template
	var responseObject = {
		error : null,
		users : null
	};
	
	// Search for all users
	var query = {};
	User.find(query, function(err, data){
		if(err){
			responseObject.error = err;
			console.error(err);
		}else{
			responseObject.users = _.map(data, function(user){
				// Filter the attributes returned
				var obj = {
						username : user.username,
						type : user.type || "default",
						name : user.name || ""
				};
				return obj;
			});
		}
		res.send(responseObject);
	});
};

/**
 * PUT - 
 */
exports.update = function(req, res){
	//TODO: validate req.body
	
	var body = req.body;
	
	// Default response template
	var responseObject = {
		error : null,
		updated : false
	};
	
	var query = {
		username : body.username
	};
	var update = {
		type : body.type || "default",
		name : body.name || ""
	};
	User.findOneAndUpdate(query, update, function(err, user){
		if(err){
			responseObject.error = err;
			console.error(err);
		}else{
			responseObject.updated = true;
		}
		res.send(responseObject);
	});
};

/**
 * DELETE - 
 */
exports.delete = function(req, res){
	res.send("deleting a user");
};

/**
 * POST - attempt user login
 */
exports.login = function(req, res){
	//TODO: validate req.params
	
	var username = req.body.username;
	var password = req.body.password;
	
	// Default response template
	var responseObject = {
		error : null,
		successful : false,
		message : null,
		type : null
	};
	
	// Attempt to authenticate user
	User.getAuthenticated(username, password, function(err, user, reason){
		if(err){
			responseObject.error = err;
			console.error(err);
			res.send(responseObject);
			return;
		}
		
		// Successful if we got a user
		if(user){
			responseObject.successful = true;
			responseObject.type = user.type;
			res.send(responseObject);
			return;
		}
		
		// Otherwise, failure
		var reasons = User.failedLogin;
		switch(reason){
			case reasons.NOT_FOUND:
				responseObject.message = "username not found";
				break;
			case reasons.PASSWORD_INCORRECT:
				responseObject.message = "password incorrect";
				break;
			case reasons.MAX_ATTEMPTS:
				responseObject.message = "max attempts exceeded, account locked for 5 minutes";
				break;
			default:
				responseObject.message = "unexpected error occurred";
		}
		res.send(responseObject);
	});
};
