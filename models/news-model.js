var mongoose = require('mongoose');

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
module.exports = mongoose.model('News', NewsSchema);
