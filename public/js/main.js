(function(){

console.log("Running main.js");

$.when(app.util.TemplateCache.setup(), app.util.Login.checkLoginState())
	.always(function(){
		// Start the router
		new app.Router();
		Backbone.history.start();
	});

})();