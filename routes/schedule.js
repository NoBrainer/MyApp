var mongoose = require('mongoose');
var Schedule = require('../models/schedule-model');

var ONE_DAY = 1000 * 60 * 60 * 24;

// Helper functions to check user privileges
var isDeveloper = function isDeveloper(req){
	var type = req.session.type || "";
	var matches = type.match(/developer/);
	return !(_.isNull(matches) || _.isUndefined(matches));
};
var isAdmin = function isAdmin(req){
	var type = req.session.type || "";
	var matches = type.match(/(admin|developer)/);
	return !(_.isNull(matches) || _.isUndefined(matches));
};
var isEmployee = function isEmployee(req){
	var type = req.session.type || "";
	var matches = type.match(/(employee|admin|developer)/);
	return !(_.isNull(matches) || _.isUndefined(matches));
};

/**
 * POST - A list of the schedule between startDate and endDate
 * @memberOf Schedule
 */
exports.getRange = function getRange(req, res){
	// Default response template
	var responseObject = {
		error : null,
		schedule : null
	};
	
	// Get variables from request body
	var body = req.body || {};
	body.startDate = body.startDate || null;
	body.endDate = body.endDate || null;
	
	// Validate the request body
	if(_.isNull(body.startDate)){
		responseObject.error = "body.startDate is required";
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}
	if(_.isNull(body.endDate)){
		responseObject.error = "body.endDate is required";
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}
	
	// Generate the date range array to help build the schedule array template
	var start = (new Date(body.startDate)).getTime();
	var end = (new Date(body.endDate)).getTime()+1;
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
			$gte : body.startDate,
			$lte : body.endDate
		}
	};
	
	// Search for all news entries
	Schedule.find(query, function(err, data){
		if(err){
			responseObject.error = err;
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
							if(isAdmin(req)){
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
 * POST - update a schedule for the given date
 * @memberOf Schedule
 */
exports.update = function update(req, res){
	// Default response template
	var responseObject = {
		error : null,
		successful : false
	};
	
	// Verify admin status
	if(!isAdmin(req)){
		responseObject.error = "Not authorized to update schedule";
		res.send(responseObject);
		return;
	}
	
	// Get variables from request body
	var body = req.body || {};
	body.date = body.date || null;
	body.entries = body.entries || [];
	
	// The date is required
	if(_.isNull(body.date)){
		responseObject.error = "Cannot update schedule without date";
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
			responseObject.error = err;
			responseObject.message = err.message;
			console.error(responseObject.message);
			res.send(responseObject);
		}else if(item){
			//TODO: see if we can just save instead of update
			// Update the news entry
			Schedule.update(query, updates, function(err, numAffected){
				if(err){
					responseObject.error = err;
					responseObject.message = err.message;
					console.error(responseObject.message);
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
					responseObject.error = err;
					console.error(err);
				}else{
					responseObject.successful = true;
				}
				res.send(responseObject);
			});
		}
	});
};


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
}
