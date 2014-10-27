var mongoose = require('mongoose');
var News = require('../models/news-model');

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
 * GET - A list of all news
 * @memberOf News
 */
exports.getAll = function getAll(req, res){
	// Default response template
	var responseObject = {
		error : null,
		news : null
	};
	
	// Search for all news items
	var query = {};
	News.find(query, function(err, data){
		if(err){
			responseObject.error = err;
			console.error(err);
		}else{
			responseObject.news = _.map(data, function(item){
				// Filter the attributes returned
				var obj = {
						postedDate : item.postedDate,
						title : item.title,
						content : item.content,
						isArchived : item.isArchived
				};
				if(isAdmin(req)){
					obj.id = item._id
				}
				return obj;
			});
		}
		res.send(responseObject);
	});
};

/**
 * POST - create a news item
 * @memberOf News
 */
exports.create = function create(req, res){
	// Default response template
	var responseObject = {
		error : null,
		successful : false,
		message : null
	};
	
	var body = req.body || {};
	body.title = body.title || "";
	body.content = body.content || "";
	body.isArchived = body.isArchived || false;
	
	// Create instance of a news item
	var currentItem = new News({
		title : body.title,
		content : body.content,
		postedDate : new Date(),
		isArchived : body.isArchived
	});
	
	// Save it
	currentItem.save(function(err, savedObj){
		if(err){
			responseObject.error = err;
			responseObject.message = err.message;
			console.error(err);
		}else{
			responseObject.successful = true;
		}
		res.send(responseObject);
	});
};

/**
 * POST - update a news item
 * @memberOf News
 */
exports.update = function update(req, res){
	// Default response template
	var responseObject = {
		error : null,
		successful : false,
		message : null
	};
	
	// Verify admin status
	if(!isAdmin(req)){
		responseObject.message = "Not authorized to update news";
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
	
	// Find the news item to update
	News.findOne(query, function(err, item){
		if(err){
			responseObject.error = err;
			responseObject.message = err.message;
			console.error(responseObject.message);
			res.send(responseObject);
		}else if(item){
			// Update the news item
			News.update(query, updates, function(err, numAffected){
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
			responseObject.message = "No news item with id = "+id;
			console.error(responseObject.message);
			res.send(responseObject);
		}
	});
};

/**
 * POST - archive news items
 * @memberOf News
 */
exports.archive = function archive(req, res){
	// Default response template
	var responseObject = {
		error : null,
		successful : false,
		message : null
	};
	
	// Verify admin status
	if(!isAdmin(req)){
		responseObject.message = "Not authorized to archive news items";
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
		res.send(responseObject);
		return;
	}
	
	// Build the update object
	var updates = {
		isArchived : true
	};
	
	// Build the query
	var query = {
		_id : {
			$in : body.ids
		}
	};
	
	// Find the news item to archive
	News.find(query, function(err, docs){
		if(err){
			responseObject.error = err;
			responseObject.message = err.message;
			console.error(responseObject.message);
			res.send(responseObject);
		}else if(docs){
			// Archive the news item
			News.update(query, updates, function(err, numAffected){
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
			responseObject.message = "No news item found";
			console.error(responseObject.message);
			res.send(responseObject);
		}
	});
};

/**
 * POST - delete news items
 * @memberOf News
 */
exports.remove = function remove(req, res){
	// Default response template
	var responseObject = {
		error : null,
		successful : false,
		message : null
	};
	
	// Verify admin status
	if(!isAdmin(req)){
		responseObject.message = "Not authorized to delete news items";
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
		res.send(responseObject);
		return;
	}
	
	// Build the query
	var query = {
		_id : {
			$in : body.ids
		}
	};
	
	// Remove the news item(s)
	News.remove(query, function(err){
		if(err){
			responseObject.error = err;
			responseObject.message = err.message;
			console.error(responseObject.message);
		}else{
			responseObject.successful = true;
		}
		res.send(responseObject);
	});
};
