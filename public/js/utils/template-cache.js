app.util.TemplateCache = {
	
	/**
	 * Get template html (at most once per selector)
	 */
	get : function(selector){
		app.util.TemplateCache.templates = app.util.TemplateCache.templates || {};
		
		var template = app.util.TemplateCache.templates[selector];
		if(!template){
			var html = $(selector).html();
			template = _.template(html);
			app.util.TemplateCache.templates[selector] = template;
		}
		
		return template;
	}
};
