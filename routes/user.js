var mongoose = require('mongoose');
var crypto = require('crypto');
var User = require('../models/user-model');
var mailUtil = require('../utils/mail-util');

// Helper functions to check user privileges
var isDeveloper = function isDeveloper(req){
	var type = req.session.type || "";
	var matches = type.match(/developer/);
	return !(_.isNull(matches) || _.isUndefined(matches));
};
var isAdmin = function isAdmin(req){
	var type = req.session.type || "";
	var matches = type.match(/(admin|developer)/);
	return !(_.isNull(matches) || _.isUndefined(matches));
};
var isEmployee = function isEmployee(req){
	var type = req.session.type || "";
	var matches = type.match(/(employee|admin|developer)/);
	return !(_.isNull(matches) || _.isUndefined(matches));
};

/**
 * GET - Check if a user exists
 * @memberOf User
 */
exports.exists = function exists(req, res){
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
 * @memberOf User
 */
exports.getAll = function getAll(req, res){
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
				if(isAdmin(req)){
					obj.isConfirmed = user.isConfirmed || false;
					obj.isLocked = user.isLocked || false;
				}
				return obj;
			});
		}
		res.send(responseObject);
	});
};

/**
 * GET - check login state
 * @memberOf User
 */
exports.isLoggedIn = function isLoggedIn(req, res){
	// Default response template
	var responseObject = {
		error : null,
		isLoggedIn : false,
		message : null,
		type : null,
		username : null,
		name : null
	};
	
	try{
		// Get username and user type from the session
		responseObject.username = req.session.username;
		responseObject.name = req.session.name;
		responseObject.type = req.session.type;
		responseObject.isLoggedIn = (responseObject.username && responseObject.name && responseObject.type);
	}catch(e){
		responseObject.error = e;
		responseObject.message = "Error checking login status";
	}finally{
		res.send(responseObject);
	}
};

/**
 * POST - attempt user login
 * @memberOf User
 */
exports.login = function login(req, res){
	//TODO: validate req.params
	
	var username = req.body.username;
	var password = req.body.password;
	
	// Default response template
	var responseObject = {
		error : null,
		successful : false,
		message : null,
		type : null,
		username : username,
		name : null
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
			responseObject.name = user.name;
			
			// Track username, name, & type in the session
			req.session.username = username;
			req.session.name = user.name;
			req.session.type = user.type;
			req.session.passwordResetId = undefined;
			req.session.passwordResetUsername = undefined;
			
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
 * @memberOf User
 */
exports.logout = function logout(req, res){
	// Default response template
	var responseObject = {
		error : null,
		successful : false,
		message : null
	};
	
	try{
		// Logout the session
		req.session.username = undefined;
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
 * @memberOf User
 */
exports.register = function register(req, res){
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
 * @memberOf User
 */
exports.confirmation = function confirmation(req, res){
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
 * @memberOf User
 */
exports.approveUser = function approveUser(req, res){
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

/**
 * POST - update the user
 * @memberOf User
 */
exports.updateUser = function updateUser(req, res){
	// Default response template
	var responseObject = {
		error : null,
		successful : false,
		message : null
	};
	
	// Get variables from request body
	var body = req.body || {};
	body.username = body.username || "";
	body.name = body.name || "";
	body.oldPassword = body.oldPassword || "";
	body.password = body.password || "";
	body.type = body.type || "";
	
	// Keep track of old password but remove it from the request body
	var oldPassword = body.oldPassword;
	body.oldPassword = undefined;
	
	// Only admins are allowed to update type or username
	if(!isAdmin(req)){
		body.type = "";
		body.username = "";
	}
	
	// Map request body to mongo update object
	var updates = {};
	updates = _.reduce(body, function(memo, value, key){
		if(!value || !key || _.isEmpty(value) || _.isEmpty(key)){
			// Ignore invalid/empty pieces
			return memo;
		}else{
			// Add valid pieces to the memo
			memo[key] = value;
			return memo;
		}
	}, updates);
	
	// Build the query
	var query = {
		username : req.session.username || ""
	};
	
	// Find the user to update
	User.findOne(query, function(err, user){
		if(err){
			responseObject.error = err;
			responseObject.message = err.message;
			console.error(responseObject.message);
			res.send(responseObject);
			return;
		}else if(user){
			// Create a callback for the updating
			var triggerUpdate = function(){
				// Update the user
				user.updateWithPasswordEncryption(query, updates, function(err, savedObj){
					if(err){
						responseObject.error = err;
						responseObject.message = err.message;
						console.error(responseObject.message);
					}else{
						responseObject.successful = true;
						_.each(updates, function(value, key){
							// Update each session variable
							if(key !== "password"){
								req.session[key] = value;
							}
						});
					}
					res.send(responseObject);
				});
			};
			
			// Decide if we are doing a password update
			if(_.isEmpty(updates.password) && _.isEmpty(oldPassword)){
				// Not doing a password update, so just update
				triggerUpdate();
			}else{
				// We are doing a password update, so check the password before updating
				user.comparePassword(oldPassword, function(err, isMatch){
					if(err){
						responseObject.error = err;
						responseObject.message = err.message;
						console.error(responseObject.message);
						res.send(responseObject);
						return;
					}
					if(isMatch){
						// Old password matches, so update
						triggerUpdate();
					}else{
						// Old password doesn't match
						responseObject.message = "Old password is incorrect";
						responseObject.error = new Error(responseObject.message);;
						console.error(responseObject.message);
						res.send(responseObject);
					}
				});
			}
		}
	});
};

/**
 * POST - update the user type
 * @memberOf User
 */
exports.updateUserType = function updateUserType(req, res){
	// Default response template
	var responseObject = {
		error : null,
		successful : false,
		message : null
	};
	
	// Verify admin status
	if(!isAdmin(req)){
		responseObject.message = "Not authorized to update users"
		res.send(responseObject);
		return;
	}
	
	// Get variables from request body
	var body = req.body || {};
	body.username = body.username || "";
	body.type = body.type || "";
	
	// Require a username
	if(_.isEmpty(body.username)){
		responseObject.message = "Invalid username";
		res.send(responseObject);
		return;
	}
	
	// Require a type
	if(_.isEmpty(body.type)){
		responseObject.message = "Invalid type";
		res.send(responseObject);
		return;
	}
	
	// Create the mongo update object
	var updates = {
		type : body.type
	};
	
	// Build the query
	var query = {
		username : body.username
	};
	
	// Find the user to update
	User.findOne(query, function(err, user){
		if(err){
			responseObject.error = err;
			responseObject.message = err.message;
			console.error(responseObject.message);
			res.send(responseObject);
			return;
		}else if(user){
			// Update the user
			User.update(query, updates, function(err, savedObj){
				if(err){
					responseObject.error = err;
					responseObject.message = err.message;
					console.error(responseObject.message);
				}else{
					responseObject.successful = true;
				}
				res.send(responseObject);
			});
		}
	});
};

/**
 * POST - Start a password reset
 * @memberOf User
 */
exports.startPasswordReset = function startPasswordReset(req, res){
	var body = req.body || {};
	var username = body.username || "";
	
	// Default response template
	var responseObject = {
		error : null,
		sentToUser : false,
		message : null
	};
	
	// Generate a query
	var query = {
		username : username
	};
	
	// Search for a single user based on confirmation id
	User.findOne(query, function(err, user){
		if(err){
			console.error(err);
			responseObject.error = err;
			responseObject.message = err.message;
			res.send(responseObject);
		}else if(user){
			// User is found, so generate a password reset id
			crypto.randomBytes(24, function(err, buf){
				if(err){
					responseObject.message = "Error generating password reset id";
					responseObject.error = err;
					console.error(err);
					console.error(responseObject.message);
					res.send(responseObject);
					return;
				}
				
				// Get the password reset id from the buffer
				var id = buf.toString('hex');
				
				// Save the id for this session
				req.session.passwordResetId = id;
				req.session.passwordResetUsername = user.username;
				
				// Then send the password reset email
				user.sendPasswordResetEmail(id, function(err, successful){
					if(err){
						console.error(err);
						responseObject.error = err;
						responseObject.message = err.message;
					}else{
						responseObject.sentToUser = true;
					}
					res.send(responseObject);
				});
			});
		}else{
			// User is not found
			responseObject.message = "ERROR: _username_ not found".replace("_username_", username);
			responseObject.error = new Error(responseObject.message);
			console.error(responseObject.message);
			res.send(responseObject);
		}
	});
};

/**
 * GET - Checks if the user can reset the password
 * @memberOf User
 */
exports.isAbleToResetPassword = function isAbleToResetPassword(req, res){
	// Default response template
	var responseObject = {
		error : null,
		isAble : false,
		message : null,
		username : req.session.passwordResetUsername
	};
	
	try{
		// req.session.passwordResetId must be set to be able to reset the password
		responseObject.isAble = !_.isUndefined(req.session.passwordResetId || req.session.passwordResetUsername);
	}catch(e){
		responseObject.error = e;
		responseObject.message = e.message;
	}
	res.send(responseObject);
};

/**
 * POST - Reset the password
 * @memberOf User
 */
exports.resetPassword = function resetPassword(req, res){
	var body = req.body || {};
	var newPassword = body.password || "";
	var id = body.id || "";
	var username = req.session.passwordResetUsername;
	
	// Default response template
	var responseObject = {
		error : null,
		successful : false,
		message : null
	};
	
	// Validate input
	if(!username || _.isEmpty(username)){
		responseObject.message = "Invalid username while confirming password reset";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}else if(!newPassword || _.isEmpty(newPassword)){
		responseObject.message = "Invalid password provided while confirming password reset";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}else if(!id || _.isEmpty(id) || id !== req.session.passwordResetId){
		responseObject.message = "Invalid id provided while confirming password reset";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}
	
	// Generate query and updates
	var query = {
		username : username
	};
	var updates = {
		password : newPassword
	};
	
	// Search for the user for a password reset
	User.findOne(query, function(err, user){
		if(err){
			responseObject.error = err;
			responseObject.message = err.message;
			console.error(err);
			res.send(responseObject);
		}else if(user){
			// User is found, so try to update the password
			user.updateWithPasswordEncryption(query, updates, function(err){
				if(err){
					responseObject.error = err;
					responseObject.message = err.message;
					console.error(responseObject.message);
				}else{
					// Succeeded
					responseObject.successful = true;
				}
				// Update the session variables and send the response
				req.session.passwordResetId = undefined;
				req.session.passwordResetUsername = undefined;
				res.send(responseObject);
			});
		}else{
			responseObject.message = "Cannot reset password for user: [_USER_]".replace("_USER_", username);
			responseObject.error = new Error(responseObject.message);
			console.error(responseObject.message);
			res.send(responseObject);
		}
	});
};
