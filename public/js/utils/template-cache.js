app.util.TemplateCache = {
	
	/**
	 * Setup templates by putting the text from the aggregate template file into the html of the page
	 */
	setup : function(){
		var opts = { url: "aggregate.template" };
		return $.ajax(opts)
			.done(function(data, textStatus, jqxhr){
				console.log("Loaded aggregate template file");
				$("#templates").html(data);
			})
			.fail(function(data, textStatus, jqxhr){
				console.log("Failed to load aggregate template file");
			});
	}
	
	/**
	 * Get template html (at most once per selector)
	 */
	,get : function(selector){
		app.util.TemplateCache.templates = app.util.TemplateCache.templates || {};
		
		var template = app.util.TemplateCache.templates[selector];
		if(!template){
			var html = $(selector).html();
			if(!html){
				return app.util.TemplateCache.get.apply([selector]);
			}
			template = _.template(html);
			app.util.TemplateCache.templates[selector] = template;
		}
		
		return template;
	}
};
