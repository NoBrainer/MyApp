// Library imports
var mongoose = require('mongoose');

// Local imports
var dateUtil = require('../utils/date-util');
var roleUtil = require('../utils/role-util');

// Primary db model
var News = require('../models/news-model');

/**
 * GET - A list of all news
 * @memberOf News
 */
var getAll = function getAll(req, res){
	// Default response template
	var responseObject = {
			error : null,
			message : null,
			news : null
	};
	
	// Search for all news entries
	var query = {};
	News.find(query, function(err, data){
		if(err){
			responseObject.message = "Error finding news";
			responseObject.error = err;
			console.error(responseObject.message);
			console.error(err);
		}else{
			responseObject.news = _.map(data, function(entry){
				// Filter the attributes returned
				var obj = {
						postedDate : entry.postedDate,
						title : entry.title,
						content : entry.content,
						isArchived : entry.isArchived
				};
				if(roleUtil.isAdmin(req)){
					obj.id = entry._id
				}
				return obj;
			});
		}
		res.send(responseObject);
	});
};

/**
 * POST - create a news entry
 * @memberOf News
 */
var create = function create(req, res){
	// Default response template
	var responseObject = {
			error : null,
			message : null,
			successful : false
	};
	
	// Verify admin status
	if(!roleUtil.isAdmin(req)){
		responseObject.message = "Not authorized to create news";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}

	// Get variables from request body
	var body = req.body || {};
	body.title = body.title || "";
	body.content = body.content || "";
	body.isArchived = body.isArchived || false;
	
	// Create instance of a news entry
	var currentItem = new News({
			title : body.title,
			content : body.content,
			postedDate : new Date(),
			isArchived : body.isArchived
	});
	
	// Save it
	currentItem.save(function(err, savedObj){
		if(err){
			responseObject.message = "Error saving news";
			responseObject.error = err;
			console.error(responseObject.message);
			console.error(err);
		}else{
			responseObject.successful = true;
		}
		res.send(responseObject);
	});
};

/**
 * POST - update a news entry
 * @memberOf News
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
		responseObject.message = "Not authorized to update news";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}
	
	// Get variables from request body
	var body = req.body || {};
	body.id = body.id || "";
	body.title = body.title || "";
	body.content = body.content || "";
	body.isArchived = body.isArchived || false;
	
	// The id is required
	if(_.isEmpty(body.id)){
		responseObject.message = "Cannot update news without id";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}
	
	// Build the update object
	var updates = {
			title : body.title,
			content : body.content,
			isArchived : body.isArchived
	};
	
	// Build the query
	var query = {
			_id : body.id
	};
	
	// Find the news entry to update
	News.findOne(query, function(err, entry){
		if(err){
			responseObject.message = "Error finding news data";
			responseObject.error = err;
			console.error(responseObject.message);
			console.error(err);
			res.send(responseObject);
		}else if(entry){
			// Update the news entry
			News.update(query, updates, function(err, numAffected){
				if(err){
					responseObject.message = "Error updating news";
					responseObject.error = err;
					console.error(responseObject.message);
					console.error(err);
				}else{
					responseObject.successful = true;
				}
				res.send(responseObject);
			});
		}else{
			responseObject.message = "No news entry with id = "+id;
			responseObject.error = new Error(responseObject.message);
			console.error(responseObject.message);
			res.send(responseObject);
		}
	});
};

/**
 * POST - delete news entries
 * @memberOf News
 */
var remove = function remove(req, res){
	// Default response template
	var responseObject = {
			error : null,
			message : null,
			successful : false
	};
	
	// Verify admin status
	if(!roleUtil.isAdmin(req)){
		responseObject.message = "Not authorized to delete news entries";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}
	
	// Get variables from request body
	var body = req.body || {};
	body.ids = body.ids || [];
	if(!_.isArray(body.ids)){
		// If given a single id, put it in an array
		body.ids = [body.ids];
	}
	
	// The id array is required
	if(_.isEmpty(body.ids)){
		responseObject.message = "Cannot archive news without an list of ids";
		responseObject.error = new Error(responseObject.message);
		console.error(responseObject.message);
		res.send(responseObject);
		return;
	}
	
	// Build the query
	var query = {
			_id : {
				$in : body.ids
			}
	};
	
	// Remove the news entries
	News.remove(query, function(err){
		if(err){
			responseObject.message = "Error removing news entries";
			responseObject.error = err;
			console.error(responseObject.message);
			console.error(err);
		}else{
			responseObject.successful = true;
		}
		res.send(responseObject);
	});
};

// Module exports
exports.getAll = getAll;
exports.create = create;
exports.update = update;
exports.remove = remove;
