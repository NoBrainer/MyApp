/*
 * REST resources for user
 */

// CREATE
exports.create = function(req, res){
	res.send("adding user");
};

// READ
exports.exists = function(req, res){
	res.send("checking if a user exists");
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
