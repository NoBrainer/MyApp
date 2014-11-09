// Library imports
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

// Local imports
// EMPTY

var transport = nodemailer.createTransport(smtpTransport(config.props.EMAIL_OPTS));

var defaultOptions = {
	from : "Email Bot <{0}>".replace("{0}", config.props.EMAIL_OPTS.auth.user),
	to : config.props.EMAIL_OPTS.auth.user,
	subject : "Default Subject",
	html : "Silly developer forgot to update <b>mail-util's defaultOptions.html!</b>"
};

/**
 * Send an email then perform a callback.
 * @param opts.to - {String} the email recipient
 * @param opts.subject - {String} the email subject
 * @param opts.html - {String} the email content
 * @param callback - {function} called after sending the email
 */
var sendEmail = function sendEmail(opts, callback){
	var opts = opts || {};
	
	// Always send emails from the bot
	opts.from = defaultOptions.from;
	
	// Setup fallback to defaults
	opts.to = opts.to || defaultOptions.to;
	opts.subject = opts.subject || defaultOptions.subject;
	opts.html = opts.html || defaultOptions.html;
	callback = callback || function(err, resp){
		if(err){
			console.log(err);
			return;
		}
		console.log("Email sent:");
		console.log(resp.message);
	};
	
	// Send the email
	transport.sendMail(opts, callback);
};

exports.sendEmail = sendEmail;
