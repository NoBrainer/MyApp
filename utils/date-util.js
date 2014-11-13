// Library imports
// EMPTY

// Local imports
// EMPTY

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

// Module exports
exports.firstDayOfMonth = firstDayOfMonth;
exports.lastDayOfMonth = lastDayOfMonth;
