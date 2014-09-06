app.util.Date = {
	
	/**
	 * Display the date as "hh:mmPER on DAY, DD MONTH YYYY" (month and day are abbreviated)
	 */
	toString : function(date){
		if(!_.isDate(date)){
			return "UNDEFINED";
		}
		
		// Pull data out of date object
		var dayOfWeek = dayOfWeekShort[date.getDay()];
		var hour = date.getHours();
		var minute = date.getMinutes();
		var day = date.getDate();
		var month = monthOfYearShort[date.getMonth()];
		var year = date.getFullYear();
		
		// Handle AM/PM
		var period = "am";
		if(hour > 12){
			hour -= 12;
			period = "pm"
		}else if(hour === 12){
			period = "pm";
		}
		
		// Build the date string
		return "hh:mmPER on DAY, DD MONTH YYYY"
				.replace(/hh/, hour)
				.replace(/mm/, minute)
				.replace(/PER/, period)
				.replace(/DAY/, dayOfWeek)
				.replace(/DD/, day)
				.replace(/MONTH/, month)
				.replace(/YYYY/, year);
	}
	
	/**
	 * Display the date as "hh:mmPER on DAY, DD MONTH YYYY"
	 */
	,toStringVerbose : function(date){
		if(!_.isDate(date)){
			return "UNDEFINED";
		}
		
		// Pull data out of date object
		var dayOfWeek = dayOfWeek[date.getDay()];
		var hour = date.getHours();
		var minute = date.getMinutes();
		var day = date.getDate();
		var month = monthOfYear[date.getMonth()];
		var year = date.getFullYear();
		
		// Handle AM/PM
		var period = "am";
		if(hour > 12){
			hour -= 12;
			period = "pm"
		}else if(hour === 12){
			period = "pm";
		}
		
		// Build the date string
		return "hh:mmPER on DAY, DD MONTH YYYY"
				.replace(/hh/, hour)
				.replace(/mm/, minute)
				.replace(/PER/, period)
				.replace(/DAY/, dayOfWeek)
				.replace(/DD/, day)
				.replace(/MONTH/, month)
				.replace(/YYYY/, year);
	}
};

var dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var monthOfYear = ["January", "February", "March", "April", "May", "June", 
                   "July", "August", "September", "October", "November", "December"];
var dayOfWeekShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var monthOfYearShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                   "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
