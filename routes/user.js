var mongoose = require('mongoose');
var User = require('../models/user-model');

/*
 * REST resources for user
 */

// CREATE
exports.create = function(req, res){
	res.send("adding user");
};

// READ
exports.exists = function(req, res){
	var emailAddress = req.params.emailAddress;
	res.send("checking if a user exists with email: "+emailAddress);
};
exports.getAll = function(req, res){
	res.send("getting all users");
};

// UPDATE
exports.update = function(req, res){
	res.send("updating a user");
};

// DELETE
exports.delete = function(req, res){
	res.send("deleting a user");
};
