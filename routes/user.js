/*
 * GET users listing.
 */
exports.list = function(req, res){
	res.send("respond with a resource");
};

/*
 * GET users listing from mongo.
 */
exports.listFromMongo = function(db){
	return function(req, res){
		var collection = db.get('usercollection');
		collection.find({}, {}, function(e, docs){
			res.render('userlist', { "userlist" : docs });
		});
	};
};

/*
 * Render a page to add new users
 */
exports.newuser = function(req, res){
	res.render('newuser', { title: 'Add New User' });
};

/*
 * POST a new user
 */
exports.adduser = function(db){
	return function(req, res){
		// Get our form values. These rely on the "name" attributes
		var userName = req.body.username;
		var userEmail = req.body.useremail;
		
		// Set our collection
		var collection = db.get('usercollection');
		
		// Submit to the DB
		collection.insert({
			"username" : userName,
			"email" : userEmail
		}, function(err, doc){
			if(err){
				res.send("There was a problem adding the information to the db.");
			}else{
				// Set the route
				res.location("userlist");
				// And forward to that location
				res.redirect("userlist");
			}
		});
	};
};
