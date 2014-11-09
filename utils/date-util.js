// Library imports
// EMPTY

// Local imports
// EMPTY

/**
 * Get the first day of the month with the time cleared.
 */
var getFirstDayOfMonth = function(date){
	if(!_.isDate(date)){
		// Default to now
		date = new Date();
	}
	
	// Prevent pass by reference
	date = new Date(date.getTime());
	
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
	if(!_.isDate(date)){
		// Default to now
		date = new Date();
	}
	
	// Prevent pass by reference
	date = new Date(date.getTime());
	
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

exports.getFirstDayOfMonth = getFirstDayOfMonth;
exports.lastDayOfMonth = lastDayOfMonth;
