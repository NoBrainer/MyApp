(function(){

console.log("Running main.js");

$.when(app.util.TemplateCache.setup())
	.done(function(){
		// Start the router
		new app.Router();
		Backbone.history.start();
	});

})();