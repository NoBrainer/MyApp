// Library imports
var crypto = require('crypto');
var mongoose = require('mongoose');

// Local imports
var mailUtil = require('../utils/mail-util');
var roleUtil = require('../utils/role-util');

// Primary db model
var User = require('../models/user-model');

/**
 * GET - Check if a user exists
 * @memberOf User
 */
var exists = function exists(req, res){
	// Default response template
	var responseObject = {
			error : null,
			message : null,
			found : false
	};

	// Get variables from request params
	var params = req.query || {};
	var username = params.username || "";
	
	// Input validation
	if(_.isEmpty(username)){
		responseObject.message = "Username is required";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}
	
	// Search for a single user based on username
	var query = {
			username : username
	};
	User.findOne(query, function(err, user){
		if(err){
			responseObject.message = "Error searching for user";
			responseObject.error = err;
			console.error(responseObject.message);
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
var getAll = function getAll(req, res){
	// Default response template
	var responseObject = {
			error : null,
			message : null,
			users : null
	};
	
	// Search for all users
	var query = {};
	User.find(query, function(err, data){
		if(err){
			responseObject.message = "Error getting all users";
			responseObject.error = err;
			console.error(responseObject.message);
			console.error(err);
		}else{
			responseObject.users = _.map(data, function(user){
				// Filter the attributes returned
				var obj = {
						username : user.username,
						type : user.type,
						name : user.name
				};
				if(roleUtil.isAdmin(req)){
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
var isLoggedIn = function isLoggedIn(req, res){
	// Default response template
	var responseObject = {
			error : null,
			message : null,
			isLoggedIn : false,
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
	}catch(err){
		responseObject.message = "Error checking login status";
		responseObject.error = err;
		console.error(responseObject.message);
		console.error(err);
	}finally{
		res.send(responseObject);
	}
};

/**
 * POST - attempt user login
 * @memberOf User
 */
var login = function login(req, res){
	// Default response template
	var responseObject = {
			error : null,
			message : null,
			successful : false,
			type : null,
			username : username,
			name : null
	};

	// Get variables from request body
	var body = req.body || {};
	var username = body.username || "";
	var password = body.password || "";
	
	// Input validation
	if(_.isEmpty(username)){
		responseObject.message = "Username is required to login";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}else if(_.isEmpty(password)){
		responseObject.message = "Password is required to login";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}
	
	// Attempt to authenticate user
	User.getAuthenticated(username, password, function(err, user, reason){
		if(err){
			responseObject.message = "Error authenticating user";
			responseObject.error = err;
			console.error(responseObject.message);
			console.error(err);
			res.send(responseObject);
			return;
		}
		
		// Successful if we got a user
		if(user){
			responseObject.successful = true;
			responseObject.type = user.type;
			responseObject.name = user.name;
			responseObject.username = user.username;
			
			// Track username, name, & type in the session
			req.session.username = user.username;
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
				responseObject.message = "Username not found";
				break;
			case reasons.PASSWORD_INCORRECT:
				responseObject.message = "Password incorrect";
				break;
			case reasons.MAX_ATTEMPTS:
				responseObject.message = "Max attempts exceeded, account locked for 5 minutes";
				break;
			case reasons.NOT_CONFIRMED:
				responseObject.message = "Username has not been confirmed. Contact an admin for another confirmation email.";
				break;
			default:
				responseObject.message = "Unexpected error occurred";
		}
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
	});
};

/**
 * POST - attempt user logout
 * @memberOf User
 */
var logout = function logout(req, res){
	// Default response template
	var responseObject = {
			error : null,
			message : null,
			successful : false
	};
	
	try{
		// Logout the session
		req.session.username = undefined;
		req.session.name = undefined;
		req.session.type = undefined;
		responseObject.successful = true;
	}catch(err){
		responseObject.message = "Failed to logout";
		responseObject.error = err;
		console.error(responseObject.message);
		console.error(err);
	}finally{
		res.send(responseObject);
	}
};

/**
 * POST - attempt user registration
 * @memberOf User
 */
var register = function register(req, res){
	// Default response template
	var responseObject = {
			error : null,
			message : null,
			successful : false
	};

	// Get variables from request body
	var body = req.body || {};
	var username = body.username || "";
	var password = body.password || "";
	var name = body.name || "";
	
	// Input validation
	if(_.isEmpty(username)){
		responseObject.message = "Username is required to register";
		responseObject.error = new Error(responseObject.message);
		res.send(responseObject);
		return;
	}else if(_.isEmpty(password)){
		responseObject.message = "Password is required to register";
		responseObject.error = new Error(responseObject.message);
		res.send(responseObject);
		return;
	}else if(_.isEmpty(name)){
		responseObject.message = "Name is required to register";
		responseObject.error = new Error(responseObject.message);
		res.send(responseObject);
		return;
	}
	
	// Generate a confirmation hash
	crypto.randomBytes(24, function(err, buf){
		if(err){
			responseObject.message = "Error generating confirmation id";
			responseObject.error = err;
			console.error(responseObject.message);
			console.error(err);
			res.send(responseObject);
			return;
		}
		
		// Get the confirmation id from the buffer
		var hash = buf.toString('hex');
		
		// Create instance of a User
		var currentUser = new User({
				username : username,
				password : password,
				name : name || "",
				confirmation : hash
		});
		
		// Save it
		currentUser.save(function(err, savedObj){
			if(err){
				responseObject.message = "Error saving user";
				responseObject.error = err;
				console.error(responseObject.message);
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
var confirmation = function confirmation(req, res){
	// Default response template
	var message = "Error during confirmation";
	
	// Get variables from request params
	var params = req.params || {};
	var id = params.id || "";
	
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
			message = "User already confirmed";
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
			message = "Invalid confirmation id [_ID]".replace("_ID", id);
			console.error(message);
			res.send(message);
		}
	});
};

/**
 * POST - approve a user (creates a new entry if one doesn't exist)
 * @memberOf User
 */
var approveUser = function approveUser(req, res){
	// Default response template
	var responseObject = {
			error : null,
			message : null,
			approved : false
	};
	
	// Verify admin status
	if(!roleUtil.isAdmin(req)){
		responseObject.message = "Not authorized to approve users";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}
	
	// Get variables from request body
	var body = req.body || {};
	var username = body.username || "";
	var type = body.type || 'employee';
	
	// Input validation
	if(_.isEmpty(username)){
		responseObject.message = "Username is required to approve users";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
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
			responseObject.message = "Error checking if user exists";
			responseObject.error = err;
			console.error(responseObject.message);
			console.error(err);
			res.send(responseObject);
		}else if(user){
			if(user.type === 'pending-approval'){
				// If user already exists & isn't approved, update its type
				User.update(query, update, function(err, numAffected){
					if(err){
						responseObject.message = "Error updating user";
						responseObject.error = err;
						console.error(responseObject.message);
						console.error(err);
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
					console.error(responseObject.message);
					console.error(err);
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
						responseObject.message = "Error saving user";
						responseObject.error = err;
						console.error(responseObject.message);
						console.error(err);
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
var updateUser = function updateUser(req, res){
	// Default response template
	var responseObject = {
			error : null,
			message : null,
			successful : false
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
	if(!roleUtil.isAdmin(req)){
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
			responseObject.message = "Error finding user";
			responseObject.error = err;
			console.error(responseObject.message);
			console.error(err);
			res.send(responseObject);
			return;
		}else if(user){
			// Create a callback for the updating
			var triggerUpdate = function(){
				// Update the user
				user.updateWithPasswordEncryption(query, updates, function(err, savedObj){
					if(err){
						responseObject.message = "Error updating user with encryption";
						responseObject.error = err;
						console.error(responseObject.message);
						console.error(err);
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
						responseObject.message = "Error comparing passwords";
						responseObject.error = err;
						console.error(responseObject.message);
						console.error(err);
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
var updateUserType = function updateUserType(req, res){
	// Default response template
	var responseObject = {
			error : null,
			message : null,
			successful : false
	};
	
	// Verify admin status
	if(!roleUtil.isAdmin(req)){
		responseObject.message = "Not authorized to update users";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}
	
	// Get variables from request body
	var body = req.body || {};
	var username = body.username || "";
	var type = body.type || "";
	
	// Input validation
	if(_.isEmpty(username)){
		responseObject.message = "Username is required the update a user's type";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}else if(_.isEmpty(type)){
		responseObject.message = "Type is required to update a users's type";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}
	
	// Create the mongo update object
	var updates = {
			type : type
	};
	
	// Build the query
	var query = {
			username : username
	};
	
	// Find the user to update
	User.findOne(query, function(err, user){
		if(err){
			responseObject.message = "Error finding user";
			responseObject.error = err;
			console.error(responseObject.message);
			console.error(err);
			res.send(responseObject);
			return;
		}else if(user){
			// Update the user
			User.update(query, updates, function(err, savedObj){
				if(err){
					responseObject.message = "Error updating user";
					responseObject.error = err;
					console.error(responseObject.message);
					console.error(err);
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
var startPasswordReset = function startPasswordReset(req, res){
	// Default response template
	var responseObject = {
			error : null,
			message : null,
			sentToUser : false
	};
	
	// Get variables from request body
	var body = req.body || {};
	var username = body.username || "";
	
	// Input validation
	if(_.isEmpty(username)){
		responseObject.message = "Username is required to start a password reset";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}
	
	// Generate a query
	var query = {
			username : username
	};
	
	// Search for a single user based on confirmation id
	User.findOne(query, function(err, user){
		if(err){
			responseObject.message = "Error finding user";
			responseObject.error = err;
			console.error(responseObject.message);
			console.error(err);
			res.send(responseObject);
		}else if(user){
			// User is found, so generate a password reset id
			crypto.randomBytes(24, function(err, buf){
				if(err){
					responseObject.message = "Error generating password reset id";
					responseObject.error = err;
					console.error(responseObject.message);
					console.error(err);
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
						responseObject.message = "Error sending password reset email";
						responseObject.error = err;
						console.error(responseObject.message);
						console.error(err);
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
var isAbleToResetPassword = function isAbleToResetPassword(req, res){
	// Default response template
	var responseObject = {
			error : null,
			message : null,
			isAble : false,
			username : req.session.passwordResetUsername
	};
	
	try{
		// req.session.passwordResetId must be set to be able to reset the password
		responseObject.isAble = !_.isUndefined(req.session.passwordResetId || req.session.passwordResetUsername);
	}catch(err){
		responseObject.message = "Error checking if able to reset password";
		responseObject.error = err;
		console.error(responseObject.message);
		console.error(err);
	}
	res.send(responseObject);
};

/**
 * POST - Reset the password
 * @memberOf User
 */
var resetPassword = function resetPassword(req, res){
	// Default response template
	var responseObject = {
			error : null,
			message : null,
			successful : false
	};

	// Get variables from request body
	var body = req.body || {};
	var newPassword = body.password || "";
	var id = body.id || "";
	var username = req.session.passwordResetUsername;
	
	// Input validation
	if(_.isEmpty(username)){
		responseObject.message = "Invalid username while confirming password reset";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}else if(_.isEmpty(newPassword)){
		responseObject.message = "Invalid password provided while confirming password reset";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}else if(_.isEmpty(id) || id !== req.session.passwordResetId){
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
			responseObject.message = "Error finding user";
			responseObject.error = err;
			console.error(responseObject.message);
			console.error(err);
			res.send(responseObject);
		}else if(user){
			// User is found, so try to update the password
			user.updateWithPasswordEncryption(query, updates, function(err){
				if(err){
					responseObject.message = "Error updating user with encryption";
					responseObject.error = err;
					console.error(responseObject.message);
					console.error(err);
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

// Module exports
exports.exists = exists;
exports.getAll = getAll;
exports.isLoggedIn = isLoggedIn;
exports.login = login;
exports.logout = logout;
exports.register = register;
exports.confirmation = confirmation;
exports.approveUser = approveUser;
exports.updateUser = updateUser;
exports.updateUserType = updateUserType;
exports.startPasswordReset = startPasswordReset;
exports.isAbleToResetPassword = isAbleToResetPassword;
exports.resetPassword = resetPassword;
