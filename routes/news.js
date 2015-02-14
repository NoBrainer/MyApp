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
			logger.error(responseObject.message, req.session);
			logger.error(err, req.session);
		}else{
			responseObject.news = _.chain(data)
				.map(function(entry){
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
				})
				.sortBy(function(entry){
					// Sort by posted date descending (most recent first)
					return entry.postedDate * -1;
				})
				.value();
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
		logger.error(responseObject.message, req.session);
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
			logger.error(responseObject.message, req.session);
			logger.error(err, req.session);
		}else{
			responseObject.successful = true;
			
			// Log the success TODO: uncomment this when issues are resolved (deleting session on logout may help)
//			var message = "Successfully created news (_TITLE_)".replace("_TITLE_", body.title);
//			logger.log(message, req.session);
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
		logger.error(responseObject.message, req.session);
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
		logger.error(responseObject.message, req.session);
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
			logger.error(responseObject.message, req.session);
			logger.error(err, req.session);
			res.send(responseObject);
		}else if(entry){
			// Update the news entry
			News.update(query, updates, function(err, numAffected){
				if(err){
					responseObject.message = "Error updating news";
					responseObject.error = err;
					logger.error(responseObject.message, req.session);
					logger.error(err, req.session);
				}else{
					responseObject.successful = true;
					
					// Log the success
					var message = "Successfully updated news item (_TITLE_)".replace("_TITLE_", body.title);
					logger.log(message, req.session);
				}
				res.send(responseObject);
			});
		}else{
			responseObject.message = "No news entry with id = "+id;
			responseObject.error = new Error(responseObject.message);
			logger.error(responseObject.message, req.session);
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
		logger.error(responseObject.message, req.session);
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
		logger.error(responseObject.message, req.session);
		res.send(responseObject);
		return;
	}
	
	// Build the query
	var query = {
			_id : {
				$in : body.ids
			}
	};
	
	//TODO: get the news items title/body/timestamp and log them with the success message
	
	// Remove the news entries
	News.remove(query, function(err){
		if(err){
			responseObject.message = "Error removing news entries";
			responseObject.error = err;
			logger.error(responseObject.message, req.session);
			logger.error(err, req.session);
		}else{
			responseObject.successful = true;
			
			// Log the success
			var message = "Successfully deleted news item";
			logger.log(message, req.session);
		}
		res.send(responseObject);
	});
};

// Module exports
exports.getAll = getAll;
exports.create = create;
exports.update = update;
exports.remove = remove;
