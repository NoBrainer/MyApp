app.util.Date = {
	
	/**
	 * Display the date as "hh:mmPER DAY, DD MONTH YYYY" (month and day are abbreviated)
	 * Ex: "7:20pm Sat, 6 Sept 2014"
	 * @memberOf app.util.Date
	 */
	toString : function toString(date){
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
		
		// Handle leading zeroes
		if(minute < 10){
			minute = "0"+minute;
		}
		
		// Build the date string
		return "hh:mmPER DAY, DD MONTH YYYY"
				.replace(/hh/, hour)
				.replace(/mm/, minute)
				.replace(/PER/, period)
				.replace(/DAY/, dayOfWeek)
				.replace(/DD/, day)
				.replace(/MONTH/, month)
				.replace(/YYYY/, year);
	}
	
	/**
	 * Display the date as "hh:mmPER DAY, DD MONTH YYYY"
	 * Ex: "7:20pm Saturday, 6 September 2014"
	 * @memberOf app.util.Date
	 */
	,toStringVerbose : function toStringVerbose(date){
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
		
		// Handle leading zeroes
		if(minute < 10){
			minute = "0"+minute;
		}
		
		// Build the date string
		return "hh:mmPER DAY, DD MONTH YYYY"
				.replace(/hh/, hour)
				.replace(/mm/, minute)
				.replace(/PER/, period)
				.replace(/DAY/, dayOfWeek)
				.replace(/DD/, day)
				.replace(/MONTH/, month)
				.replace(/YYYY/, year);
	}
	
	/**
	 * Display the date as "DAY, MM/DD"
	 * Ex: "Sat, 9/6"
	 * @memberOf app.util.Date
	 */
	,toStringShort : function toStringShort(date){
		if(!_.isDate(date)){
			return "UNDEFINED";
		}
		
		// Pull data out of date object
		var dayOfWeek = dayOfWeekShort[date.getDay()];
		var day = date.getDate();
		var month = date.getMonth()+1;
		
		// Build the date string
		return "DAY, MM/DD"
				.replace(/DAY/, dayOfWeek)
				.replace(/MM/, month)
				.replace(/DD/, day);
	}
	
	/**
	 * Get the date object with hours/minutes/seconds/milliseconds set to zero
	 * @memberOf app.util.Date
	 */
	,startOfDay : function startOfDay(date){
		if(!_.isDate(date)){
			date = new Date(); //default to now
		}
		
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		
		return date;
	}
	
	/**
	 * Get the date object with the date number incremented
	 * @memberOf app.util.Date
	 */
	,nextDay : function nextDay(date){
		if(!_.isDate(date)){
			date = new Date(); //default to now
		}
		
		// Increment the date
		date.setDate(date.getDate()+1);
		return date;
	}
	
	/**
	 * Get the date object with the date number decremented
	 * @memberOf app.util.Date
	 */
	,prevDay : function prevDay(date){
		if(!_.isDate(date)){
			date = new Date();//default to now
		}
		
		// Decrement the date
		date.setDate(date.getDate()-1);
		return date;
	}
};

var dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var monthOfYear = ["January", "February", "March", "April", "May", "June", 
                   "July", "August", "September", "October", "November", "December"];
var dayOfWeekShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var monthOfYearShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                   "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
