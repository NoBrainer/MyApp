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
		
		// Test password matching
//		user.comparePassword(testPassword, function(err, isMatch){
//			if(err) throw err;
//			
//			console.log("Password match?", isMatch);
//		});
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
