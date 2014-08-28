var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var mailUtil = require('../utils/mail-util');

var SALT_WORK_FACTOR = 10;
var MAX_LOGIN_ATTEMPTS = 5;
var LOCK_TIME = 5 * 60 * 1000; //5min

var DEFAULT_NAME = "Default Name";
var DEFAULT_PASSWORD = "password";

// Initialize schema
var UserSchema = mongoose.Schema({
	username : {
		type : String,
		required : true,
		index : {
			unique : true
		}
	},
	password : {
		type : String,
		required : true,
		default: DEFAULT_PASSWORD
	},
	type : { // pending-approval < employee < admin < developer
		type : String,
		required : true,
		default : 'pending-approval'
	},
	name : {
		type : String,
		required : true,
		default : DEFAULT_NAME
	},
	loginAttempts : {
		type : Number,
		required : true,
		default : 0
	},
	lockUntil : {
		type : Number
	},
	confirmation : {
		type : String
	},
	isConfirmed : {
		type : Boolean,
		required : true,
		default : false
	}
});

// Add virtual property to determine if the user account is locked
UserSchema.virtual('isLocked').get(function(){
	// Check for a future lockUntil timestamp
	return (this.lockUntil && this.lockUntil > Date.now());
});

// Enum for authentication failure reasons
var reasons = UserSchema.statics.failedLogin = {
	NOT_FOUND : 0,
	PASSWORD_INCORRECT : 1,
	MAX_ATTEMPTS : 2
};

// Make sure usernames are unique
UserSchema.pre('save', function(next, done){
	var self = this;
	
	// Generate query for this user
	var query = { username : self.username };
	
	// Look through the users for this user
	mongoose.models['User'].findOne(query, function(err, user){
		if(err){
			done(err);
		}else if(user){
			if(user.isConfirmed === false){
				// Make sure the type is preserved so pre-approval isn't lost
				self.type = user.type;
				
				// If user hasn't been confirmed or approved, remove it before saving a new version
				user.remove();
				next();
			}else{
				// If user has been confirmed, throw an error
				var msg = "{0} already registered".replace(/\{0\}/, self.username);
				done(new Error(msg));
			}
		}else{
			// No users found with this username, so proceed to save
			next();
		}
	});
});

// Hash the password when saving
UserSchema.pre('save', function(next){
	var self = this;
	
	// If the password has not been modified and the password is not the default,
	// then no need to hash the password again
	if(!self.isModified('password') && self.password !== DEFAULT_PASSWORD){
		return next();
	}
	
	// Generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
		if(err){
			return next(err);
		}
		
		// Hash the password using the new salt
		bcrypt.hash(self.password, salt, function(err, hash){
			if(err){
				return next(err);
			}
			
			// Override the password with the new hashed one
			self.password = hash;
			next();
		});
	});
});

// Update with a hook to encrypt the password beforehand
UserSchema.methods.updateWithPasswordEncryption = function(query, updates, done){
	var self = this;
	
	// Setup the next function to be updating if there is no error
	var next = function(err){
		if(err){
			return done(err, 0);
		}
		mongoose.models['User'].update(query, updates, done);
	};
	
	// Hash the password if necessary
	if(updates.password){
		// Generate a salt
		bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
			if(err){
				return next(err);
			}
			
			// Hash the password using the new salt
			bcrypt.hash(updates.password, salt, function(err, hash){
				if(err){
					return next(err);
				}
				
				// Override the password with the new hashed one
				updates.password = hash;
				next();
			});
		});
	}else{
		next();
	}
};

// Send a confirmation email after saving a user
var sendConfirmationEmail = function(){
	var self = this;
	
	// Do nothing if the user is already confirmed
	if(self.isConfirmed){
		return;
	}
	
	var emailAddress = self.username || "";
	
	console.log("Sending confirmation email to "+emailAddress);
	
	// Create the email content with the confirmation link
	var id = self.confirmation;
	var emailContent;
	if(self.type === 'pending-approval'){
		// If the user has not been approved yet, send the regular confirmation email
		emailContent = "Click this link to confirm your registration: " +
				"<a target='_blank' href='/api/users/confirmation/_ID_'>_ID_</a>" +
				"<br/><br/>" +
				"You have not yet been approved. Please contact an admin to have them approve you.";
	}else{
		// If the user has been pre-approved, send a modified confirmation email
		emailContent = "You have been approved for an account. Click this link to confirm your registration: " +
				"<a target='_blank' href='/api/users/confirmation/_ID_'>_ID_</a>" +
				"<br/><br/>" +
				"Then login with these credentials and reset your password:" +
				"<br/>" +
				"<b>Username:</b> _USERNAME_" +
				"<br/>" +
				"<b>Password:</b> _PASSWORD_";
	}
	
	// Add the variable information to the email content
	emailContent = emailContent
			.replace(/_ID_/g, id)
			.replace(/_USERNAME_/g, emailAddress)
			.replace(/_PASSWORD_/g, DEFAULT_PASSWORD);
	
	var params = {
		to : emailAddress,
		subject : "Confirm your registration",
		html : emailContent
	};
	mailUtil.sendEmail(params);
};
UserSchema.post('save', sendConfirmationEmail);
UserSchema.post('update', sendConfirmationEmail);

// Add a method to the schema for comparing passwords
UserSchema.methods.comparePassword = function(candidate, done){
	bcrypt.compare(candidate, this.password, function(err, isMatch){
		if(err) return done(err);
		done(null, isMatch);
	});
};

// Increment the login attempts
UserSchema.methods.incrementLoginAttempts = function(done){
	// If it's locked and it has expired, reset
	if(this.lockUntil && this.lockUntil < Date.now()){
		return this.update({
			$set : { loginAttempts : 1 },
			$unset : { lockUntil : 1 }
		}, done);
	}
	
	// Otherwise, increment
	var updates = {
		$inc : { loginAttempts : 1 }
	};
	
	// Lock the account if the max number of attempts has been reached
	if(this.loginAttempts+1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked){
		updates.$set = {
			lockUntil : Date.now() + LOCK_TIME
		};
	}
	
	return this.update(updates, done);
};

// Try to authenticate user
UserSchema.statics.getAuthenticated = function(username, password, done){
	var query = {
		username : username
	};
	this.findOne(query, function(err, user){
		if(err){
			return done(err);
		}
		
		// Check if user was found
		if(!user){
			return done(null, null, reasons.NOT_FOUND);
		}
		
		// Check if the account is already locked
		if(user.isLocked){
			return user.incrementLoginAttempts(function(err){
				if(err) return done(err);
				return done(null, null, reasons.MAX_ATTEMPTS);
			});
		}
		
		// Test password matching
		user.comparePassword(password, function(err, isMatch){
			if(err){
				return done(err);
			}
			
			// Password is correct
			if(isMatch){
				// Check if there are previous login attempts or if account is locked
				if(!user.loginAttempts && !user.lockUntil){
					return done(null, user);
				}
				
				// Reset attempts and lock
				var updates = {
					$set : { loginAttempts : 0 },
					$unset : { lockUntil : 1 }
				};
				return user.update(updates, function(err){
					if(err){
						return done(err);
					}
					return done(null, user);
				});
			}
			
			// Incorrect password, so increment login attempts
			user.incrementLoginAttempts(function(err){
				if(err){
					return done(err);
				}
				return done(null, null, reasons.PASSWORD_INCORRECT);
			});
		});
	});
};

// Try to send a password reset email
UserSchema.methods.sendPasswordResetEmail = function(id, done){
	try{
		// Generate the email html
		var emailContent = 
			"Click this " +
			"<a target='_blank' href='/#resetPassword/_ID_'>link</a> " +
			"to reset your password." +
			"<br/><br/>" +
			"If you did not try to reset your password, then please delete this email.";
		
		// Add the variable information to the email content
		emailContent = emailContent
				.replace(/_ID_/g, id);
		
		// Build the params and send the email
		var params = {
			to : this.username,
			subject : "Password Reset",
			html : emailContent
		};
		console.log("Sending password reset email to "+this.username);
		mailUtil.sendEmail(params);
		return done();
	}catch(e){
		return done(e);
	}
};

// Compile and export the model
module.exports = mongoose.model('User', UserSchema);
