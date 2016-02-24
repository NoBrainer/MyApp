// Library imports
var mongoose = require('mongoose');

// Local imports
// EMPTY

/**
 * Initialize schema
 */
var NewsSchema = mongoose.Schema({
	postedDate : {
		type : Date,
		required : true,
		default: Date.now
	},
	title : {
		type : String,
		required : true
	},
	content : {
		type : String,
		required : true
	},
	isArchived : {
		type : Boolean,
		required : true,
		default : false
	}
});

// Compile and export the model
module.exports = db.model('News', NewsSchema);
