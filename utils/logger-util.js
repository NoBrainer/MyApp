// Library imports
// EMPTY

// Local imports
var dateUtil = require('./date-util');

/**
 * Generate a prefix with the current timestamp
 * @param session - (optional) session object to print user data
 */
var generatePrefix = function(session){
	var prefix = "TIME_SESSION_: ";
	
	// Generate the timestamp and add it to the prefix
	var now = new Date();
	var timestamp = dateUtil.toLogFormat(now);
	prefix = prefix.replace("TIME_", timestamp);
	
	// Generate the session string and add it to the prefix
	var sessionString = "";
	if(session){
		var email = session.username;
		if(email){
			sessionString = "(A)".replace("A", email);
		}
	}
	prefix = prefix.replace("SESSION_", sessionString);
	
	return prefix;
}

/**
 * Add a prefix (timestamp + metadata) before printing with console.error
 * @param message - message to print
 * @param session - (optional) session object to print user data
 */
var error = function(message, session){
	// Generate the prefix
	var prefix = generatePrefix(session);
	
	// Print the message with a prefix
	var modifiedMessage = prefix + message;
	console.error(modifiedMessage);
};

/**
 * Add a prefix (timestamp + metadata) before printing with console.warn
 * @param message - message to print
 * @param session - (optional) session object to print user data
 */
var warn = function(message, session){
	// Generate the prefix
	var prefix = generatePrefix(session);
	
	// Print the message with a prefix
	var modifiedMessage = prefix + message;
	console.warn(modifiedMessage);
};

/**
 * Add a prefix (timestamp + metadata) before printing with console.info
 * @param message - message to print
 * @param session - (optional) session object to print user data
 */
var info = function(message, session){
	// Generate the prefix
	var prefix = generatePrefix(session);
	
	// Print the message with a prefix
	var modifiedMessage = prefix + message;
	console.info(modifiedMessage);
};

/**
 * Add a prefix (timestamp + metadata) before printing with console.debug
 * @param message - message to print
 * @param session - (optional) session object to print user data
 */
var debug = function(message, session){
	// Generate the prefix
	var prefix = generatePrefix(session);
	
	// Print the message with a prefix
	var modifiedMessage = prefix + message;
	console.debug(modifiedMessage);
};

/**
 * Add a prefix (timestamp + metadata) before printing with console.log
 * @param message - message to print
 * @param session - (optional) session object to print user data
 */
var log = function(message, session){
	// Generate the prefix
	var prefix = generatePrefix(session);
	
	// Print the message with a prefix
	var modifiedMessage = prefix + message;
	console.log(modifiedMessage);
};

// Module exports
exports.error = error;
exports.warn = warn;
exports.info = info;
exports.debug = debug;
exports.log = log;
