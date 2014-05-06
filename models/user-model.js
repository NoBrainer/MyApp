var bcrypt = require('bcrypt');
var mongoose = require('mongoose');

var SALT_WORK_FACTOR = 10;

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
		type: String,
		required: true
	},
	type : {
		type: String,
		required: true
	},
	name : {
		type: String,
		required: true
	}
});

// Make sure usernames are unique
UserSchema.pre('save', function(next, done){
	var self = this;
	
	// Look through the users
	mongoose.models['User'].findOne({ username : self.username }, function(err, user){
		if(err){
			done(err);
		}else if(user){
			var msg = "username must be unique";
			self.invalidate('username', msg);
			done(new Error(msg));
		}else{
			// No users found with this username, so proceed
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

// Add a method to the schema for comparing passwords
UserSchema.methods.comparePassword = function(candidate, cb){
	bcrypt.compare(candidate, this.password, function(err, isMatch){
		if(err) return cb(err);
		cb(null, isMatch);
	});
};

// Compile and export the model
module.exports = mongoose.model('User', UserSchema);
