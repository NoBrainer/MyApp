// Library imports
// EMPTY

// Local imports
// EMPTY

/**
 * Check if the user is a developer
 */
var isDeveloper = function isDeveloper(req){
	var type = req.session.type || "";
	var matches = type.match(/developer/);
	return !(_.isNull(matches) || _.isUndefined(matches));
};

/**
 * Check if the user is an admin
 */
var isAdmin = function isAdmin(req){
	var type = req.session.type || "";
	var matches = type.match(/(admin|developer)/);
	return !(_.isNull(matches) || _.isUndefined(matches));
};

/**
 * Check if the user is an employee
 */
var isEmployee = function isEmployee(req){
	var type = req.session.type || "";
	var matches = type.match(/(employee|admin|developer)/);
	return !(_.isNull(matches) || _.isUndefined(matches));
};

// Module exports
exports.isDeveloper = isDeveloper;
exports.isAdmin = isAdmin;
exports.isEmployee = isEmployee;