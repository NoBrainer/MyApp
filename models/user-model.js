var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var mailUtil = require('../utils/mail-util');

var SALT_WORK_FACTOR = 10;
var MAX_LOGIN_ATTEMPTS = 5;
var LOCK_TIME = 5 * 60 * 1000; //5min

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
		required : true
	},
	type : {
		type : String,
		required : true,
		default : "unconfirmed"
	},
	name : {
		type : String,
		required : true
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
	
	// Look through the users
	mongoose.models['User'].findOne({ username : self.username }, function(err, user){
		if(err){
			done(err);
		}else if(user){
			if(user.type === 'unconfirmed'){
				// If user hasn't been confirmed, remove it before saving a new version
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
	
	// Only has the password if it has been modified (or is new)
	if(!self.isModified('password')){
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

// Send a confirmation email after saving a user
UserSchema.post('save', function(){
	var self = this;
	var emailAddress = self.username || "";
	
	console.log("Sending confirmation email to "+emailAddress);
	
	// Create the email content with the confirmation link
	var id = self.confirmation;
	var emailContent = "Click this link to confirm your registration: <a target='_blank' href='https://localhost:3000/api/users/confirmation/{ID}'>{ID}</a>";
	emailContent = emailContent.replace(/\{ID\}/g, id);
	
	var params = {
		to : emailAddress,
		subject : "Confirm your registration",
		html : emailContent
	};
	mailUtil.sendEmail(params);
});

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

// Compile and export the model
module.exports = mongoose.model('User', UserSchema);
