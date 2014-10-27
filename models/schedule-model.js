var mongoose = require('mongoose');

/**
 * Initialize schedule entry schema
 */
var ScheduleEntry = mongoose.Schema({
	username : {
		type : String,
		required : true,
		default : "",
		index : {
			unique : true
		}
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
});

/**
 * Initialize schedule schema
 */
var ScheduleSchema = mongoose.Schema({
	date : {
		type : Date,
		required : true
	},
	entries : [ScheduleEntry]
});

// Compile and export the model
module.exports = mongoose.model('Schedule', ScheduleSchema);
