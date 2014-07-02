var mongoose = require('mongoose');
var crypto = require('crypto');
var User = require('../models/user-model');

// Helper functions to check user privileges
var isDeveloper = function(req){
	var type = req.session.type || "";
	var matches = type.match(/developer/);
	return !(_.isNull(matches) || _.isUndefined(matches));
};
var isAdmin = function(req){
	var type = req.session.type || "";
	var matches = type.match(/(admin|developer)/);
	return !(_.isNull(matches) || _.isUndefined(matches));
};
var isEmployee = function(req){
	var type = req.session.type || "";
	var matches = type.match(/(employee|admin|developer)/);
	return !(_.isNull(matches) || _.isUndefined(matches));
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
						type : user.type,
						name : user.name
				};
				return obj;
			});
		}
		res.send(responseObject);
	});
};

/**
 * GET - check login state
 */
exports.isLoggedIn = function(req, res){
	// Default response template
	var responseObject = {
		error : null,
		isLoggedIn : false,
		message : null,
		type : null,
		username : null
	};
	
	try{
		// Get username and user type from the session
		responseObject.username = req.session.name;
		responseObject.type = req.session.type;
		responseObject.isLoggedIn = (responseObject.username && responseObject.type);
	}catch(e){
		responseObject.error = e;
		responseObject.message = "Error checking login status";
	}finally{
		res.send(responseObject);
	}
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
		type : null,
		username : username
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
			
			// Track username and user type in the session
			req.session.name = username;
			req.session.type = user.type;
			
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

/**
 * POST - attempt user logout
 */
exports.logout = function(req, res){
	// Default response template
	var responseObject = {
		error : null,
		successful : false,
		message : null
	};
	
	try{
		// Logout the session
		req.session.name = undefined;
		req.session.type = undefined;
		responseObject.successful = true;
	}catch(e){
		responseObject.error = e;
		responseObject.message = "Failed to logout";
	}finally{
		res.send(responseObject);
	}
};

/**
 * POST - attempt user registration
 */
exports.register = function(req, res){
	// Default response template
	var responseObject = {
		error : null,
		successful : false,
		message : null
	};
	
	//TODO: validate req.body
	var body = req.body || {};
	
	// Generate a confirmation hash
	crypto.randomBytes(24, function(err, buf){
		if(err){
			responseObject.message = "Error generating confirmation id";
			responseObject.error = err;
			console.error(err);
			console.error(responseObject.message);
			res.send(responseObject);
			return;
		}
		
		// Get the confirmation id from the buffer
		var hash = buf.toString('hex');
		
		// Create instance of a User
		var currentUser = new User({
			username : body.username,
			password : body.password,
			name : body.name || "",
			confirmation : hash
		});
		
		// Save it
		currentUser.save(function(err, savedObj){
			if(err){
				responseObject.error = err;
				responseObject.message = err.message;
				console.error(err);
			}else{
				responseObject.successful = true;
			}
			res.send(responseObject);
		});
	});
};

/**
 * POST - attempt user registration
 */
exports.confirmation = function(req, res){
	var params = req.params || {};
	var id = params.id || "";
	
	var message = "";
	
	// Generate a query
	var query = {
		confirmation : id
	};
	
	// Search for a single user based on confirmation id
	User.findOne(query, function(err, user){
		if(err){
			console.error(err);
			res.send(err);
		}else if(user && user.isConfirmed===true){
			// Users can only be confirmed if they haven't yet been confirmed
			message = "ERROR: User already confirmed";
			console.error(message);
			res.send(message);
		}else if(user && user.isConfirmed===false){
			// Mark user as confirmed
			var update = {
				confirmation : null,
				isConfirmed : true
			};
			User.findOneAndUpdate(query, update, function(err, user){
				if(err){
					console.error(err);
					res.send(err);
				}else{
					message = "Successfully confirmed email address: "+user.username;
					console.log(message);
					res.send(message);
				}
			});
		}else{
			message = "ERROR: invalid confirmation id";
			res.send(message);
		}
	});
};

/**
 * POST - approve a user (creates a new entry if one doesn't exist)
 */
exports.approveUser = function(req, res){
	// Default response template
	var responseObject = {
		error : null,
		approved : false,
		message : null
	};
	
	// Verify admin status
	if(!isAdmin(req)){
		responseObject.message = "Not authorized to approve users"
		res.send(responseObject);
		return;
	}
	
	// Get variables from request body
	var body = req.body || {};
	var username = body.username || "";
	var type = body.type || 'employee';
	
	// Validate input
	if(!username){
		responseObject.message = "req.body.username required to approve users"
		res.send(responseObject);
		return;
	}
	
	// Generate query
	var query = {
		username : username
	};
	
	// Generate update
	var update = {
		type : type
	};
	
	// Check if the user exists
	User.findOne(query, function(err, user){
		if(err){
			responseObject.error = err;
			responseObject.message = "Error checking if user exists";
			console.error(responseObject.message);
		}else if(user){
			if(user.type === 'pending-approval'){
				// If user already exists & isn't approved, update its type
				User.update(query, update, function(err, numAffected){
					if(err){
						responseObject.error = err;
						responseObject.message = err.message;
						console.error(responseObject.message);
					}else if(numAffected > 0){
						responseObject.approved = true;
					}
					res.send(responseObject);
				});
			}else{
				// If user already exists & is already approved, throw an error
				responseObject.message = "Cannot approve a user more than once";
				responseObject.error = new Error(responseObject.message);
				console.error(responseObject.message);
				res.send(responseObject);
			}
		}else{
			// If user doesn't exist, create one with its own confirmation hash
			crypto.randomBytes(24, function(err, buf){
				if(err){
					responseObject.message = "Error generating confirmation id";
					responseObject.error = err;
					console.error(err);
					console.error(responseObject.message);
					res.send(responseObject);
					return;
				}
				
				// Get the confirmation id from the buffer
				var hash = buf.toString('hex');
				
				// Create a new user
				var newUser = new User({
					username : username,
					type : type,
					confirmation : hash
				});
				
				// Save it
				newUser.save(function(err, savedObj){
					if(err){
						responseObject.error = err;
						responseObject.message = err.message;
						console.error(responseObject.message);
					}else{
						responseObject.approved = true;
					}
					res.send(responseObject);
				});
			});
		}
	});
};