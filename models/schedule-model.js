// Library imports
var mongoose = require('mongoose');

// Local imports
// EMPTY

/**
 * Initialize schedule entry schema
 */
var ScheduleEntry = mongoose.Schema({
	username : {
		type : String,
		required : true,
		default : ""
	},
	name : {
		type : String,
		required : true,
		default : ""
	},
	shift : {
		type : String,
		required : true,
		default : ""
	}
}, { _id : false });

/**
 * Initialize schedule schema
 */
var ScheduleSchema = mongoose.Schema({
	dateString : {
		type : String,
		required : true
	},
	date : {
		type : Date,
		required : true
	},
	entries : [ScheduleEntry]
});

// Compile and export the model
module.exports = db.model('Schedule', ScheduleSchema);
