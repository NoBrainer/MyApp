// Library imports
// EMPTY

// Local imports
// EMPTY

// Local variables
var dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var monthOfYear = ["January", "February", "March", "April", "May", "June", 
                   "July", "August", "September", "October", "November", "December"];
var dayOfWeekShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var monthOfYearShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                   "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

/**
 * Prevent pass by-reference and convert {Number|String} dates into {Date}
 */
var preventPassByReference = function(date){
	if(_.isDate(date)){
		date = new Date(date.getTime());
	}else{
		date = new Date(date);
		if(date.toString() === "Invalid Date"){
			date = new Date(); //default to now
		}
	}
	return date;
};

/**
 * Get the first day of the month with the time cleared.
 */
var firstDayOfMonth = function(date){
	date = preventPassByReference(date);
	
	// Zero-out the time
	date.setMilliseconds(0);
	date.setSeconds(0);
	date.setMinutes(0);
	date.setHours(0);
	
	// Set the day to the first
	date.setDate(1);
	
	return date;
};

/**
 * Get the last day of the month with the time maxed out (23:59:59:999).
 */
var lastDayOfMonth = function(date){
	date = preventPassByReference(date);
	
	// Max-out the time
	date.setMilliseconds(999);
	date.setSeconds(59);
	date.setMinutes(59);
	date.setHours(23);
	
	// Set the day to the day before the first of the next month
	date.setMonth(date.getMonth()+1);
	date.setDate(0);
	
	return date;
};

/**
 * Display the date as "YYYY-MM-DD hh:mm:ss"
 * Ex: "2014-11-06 19:20:00"
 */
var toLogFormat = function(date){
	date = preventPassByReference(date);
	
	// Pull data out of date object
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var seconds = date.getSeconds();
	
	// Handle leading zeroes
	if(month < 10){
		month = "0"+month;
	}
	if(day < 10){
		day = "0"+day;
	}
	if(hour < 10){
		hour = "0"+hour;
	}
	if(minute < 10){
		minute = "0"+minute;
	}
	if(seconds < 10){
		seconds = "0"+seconds;
	}
	
	// Build the date string
	return "YYYY-MM-DDThh:mm:ss"
			.replace(/YYYY/, year)
			.replace(/MM/, month)
			.replace(/DD/, day)
			.replace(/hh/, hour)
			.replace(/mm/, minute)
			.replace(/ss/, seconds);
};

// Module exports
exports.firstDayOfMonth = firstDayOfMonth;
exports.lastDayOfMonth = lastDayOfMonth;
exports.toLogFormat = toLogFormat;
