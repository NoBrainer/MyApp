// Library imports
var mongoose = require('mongoose');

// Local imports
var dateUtil = require('../utils/date-util');
var roleUtil = require('../utils/role-util');

// Primary db model
var Schedule = require('../models/schedule-model');

// Constants
var ONE_DAY = 1000 * 60 * 60 * 24;

/**
 * Generate the date string with format YYYY-MM-DD
 */
var generateDateString = function generateDateString(date){
	date = (_.isDate(date) ? date : new Date(date));
	
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();
	day = (day<10 ? "0"+day : day);
	var id = "YYYY-MM-DD"
			.replace(/YYYY/, year)
			.replace(/MM/, month)
			.replace(/DD/, day);
	
	return id;
};

/**
 * GET - A list of every schedule entry
 * @memberOf Schedule
 */
var getAll = function getAll(req, res){
	// Default response template
	var responseObject = {
			error : null,
			message : null,
			schedule : null
	};
	
	// Generate the query
	var query = {};
	
	// Search for all schedule entries
	Schedule.find(query, function(err, data){
		if(err){
			responseObject.message = "Error finding user";
			responseObject.error = err;
			console.error(responseObject.message);
			console.error(err);
		}else{
			// Filter the attributes returned
			responseObject.schedule = _.map(data, function(item){
				return {
						dateString : item.dateString,
						date : item.date,
						entries : _.map(item.entries, function(entry){
							var obj = {
									username : entry.username,
									name : entry.name,
									dateString : entry.dateString,
									shift : ""
							};
							if(roleUtil.isAdmin(req)){
								obj.shift = entry.shift;
							}
							return obj;
						})
				};
			});
		}
		res.send(responseObject);
	});
};

/**
 * GET - A list of the schedule between startDate and endDate
 * @memberOf Schedule
 */
var getRange = function getRange(req, res){
	// Default response template
	var responseObject = {
			error : null,
			message : null,
			schedule : null
	};
	
	// Get variables from request params
	var params = req.query || {};
	params.startDate = params.startDate || null;
	params.endDate = params.endDate || null;
	
	// Validate the request params
	if(_.isNull(params.startDate)){
		responseObject.message = "Cannot get date range without startDate";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}
	if(_.isNull(params.endDate)){
		responseObject.message = "Cannot get date range without endDate";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}
	
	// Generate the date range array to help build the schedule array template
	var start = (new Date(params.startDate)).getTime();
	var end = (new Date(params.endDate)).getTime()+1;
	var step = ONE_DAY;
	var dateRange = _.range(start, end, step);
	dateRange = _.map(dateRange, function(millis){
		return new Date(millis);
	});
	
	// Build a schedule array template
	var scheduleTemplate = _.map(dateRange, function(date){
		var dateString = generateDateString(date);
		return {
				dateString : dateString,
				date : date,
				entries : []
		};
	});
	
	// Generate the query
	var query = {
			date : {
				$gte : params.startDate,
				$lte : params.endDate
			}
	};
	
	// Search for all schedule entries
	Schedule.find(query, function(err, data){
		if(err){
			responseObject.message = "Error finding schedule data";
			responseObject.error = err;
			console.error(responseObject.message);
			console.error(err);
		}else{
			// Filter the attributes returned
			var mappedData = _.map(data, function(item){
				return {
						dateString : item.dateString,
						date : item.date,
						entries : _.map(item.entries, function(entry){
							var obj = {
									username : entry.username,
									name : entry.name,
									dateString : entry.dateString,
									shift : ""
							};
							if(roleUtil.isAdmin(req)){
								obj.shift = entry.shift;
							}
							return obj;
						})
				};
			});
			// Fill out the template with data where applicable
			responseObject.schedule = _.map(scheduleTemplate, function(item){
				var dateString = generateDateString(item.date);
				var scheduleItem = _.findWhere(mappedData, { dateString : dateString });
				if(!_.isEmpty(scheduleItem)){
					item.entries = scheduleItem.entries;
				}
				return item;
			});
		}
		res.send(responseObject);
	});
};

/**
 * GET - A list of the schedule during the specified month
 * @memberOf Schedule
 */
var getMonth = function getMonth(req, res){
	// Default response template
	var responseObject = {
			error : null,
			message : null,
			schedule : null,
			month : null
	};
	
	// Get variables from request params
	var params = req.query || {};
	params.date = params.date || null;
	
	// Try to build the query
	var query = {};
	if(!_.isNull(params.date)){
		// Build the query based on the date
		var startDate = dateUtil.getFirstDayOfMonth(params.date);
		var endDate = dateUtil.getLastDayOfMonth(params.date);
		query.date = {
				$gte : startDate,
				$lte : endDate
		};
		
		// Keep track of which month we're looking at
		responseObject.month = "MONTH-YEAR"
				.replace("MONTH", startDate.getMonth()+1)
				.replace("YEAR", startDate.getFullYear());
	}else{
		// Otherwise, we don't have enough data to proceed
		responseObject.message = "Cannot get month of schedule without date";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}
	
	// Make the call
	//TODO: finish implementation
};

/**
 * POST - update a schedule for the given date
 * @memberOf Schedule
 */
var update = function update(req, res){
	// Default response template
	var responseObject = {
			error : null,
			message : null,
			successful : false
	};
	
	// Verify admin status
	if(!roleUtil.isAdmin(req)){
		responseObject.message = "Not authorized to update schedule";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}
	
	// Get variables from request body
	var body = req.body || {};
	body.date = body.date || null;
	body.entries = body.entries || [];
	
	// The date is required
	if(_.isNull(body.date)){
		responseObject.message = "Cannot update schedule without date";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}
	
	// Build the update object
	var updates = {
			date : body.date,
			entries : body.entries
	};
	
	// Build the query
	var query = {
			date : new Date(body.date)
	};
	
	// Find the schedule date to update
	Schedule.findOne(query, function(err, item){
		if(err){
			responseObject.message = "Error finding schedule data";
			responseObject.error = err;
			console.error(responseObject.message);
			console.error(err);
			res.send(responseObject);
		}else if(item){
			//TODO: see if we can just save instead of update
			// Update the schedule entry
			Schedule.update(query, updates, function(err, numAffected){
				if(err){
					responseObject.message = "Error updating schedule";
					responseObject.error = err;
					console.error(responseObject.message);
					console.error(err);
				}else{
					responseObject.successful = true;
				}
				res.send(responseObject);
			});
		}else{
			// Generate the dateString
			var dateString = generateDateString(body.date);
			
			// Create instance of a Schedule and save it
			var newItem = new Schedule({
					date : body.date,
					entries : body.entries,
					dateString : dateString
			});
			newItem.save(function(err, savedObj){
				if(err){
					responseObject.message = "Error saving schedule";
					responseObject.error = err;
					console.error(responseObject.message);
					console.error(err);
				}else{
					responseObject.successful = true;
				}
				res.send(responseObject);
			});
		}
	});
};

//Module exports
exports.getAll = getAll;
exports.getRange = getRange;
exports.getMonth = getMonth;
exports.update = update;
