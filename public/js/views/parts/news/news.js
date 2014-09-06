app.view.part.News = Backbone.View.extend({
	
	el : ""
	
	/**
	 * Constructor
	 */
	,initialize : function(){
		
	}
	
	/**
	 * Render
	 */
	,render : function(){
		var self = this;
		
		// Add the html to the page
		var params = {}
		var template = app.util.TemplateCache.get("#news-template");
		var html = template(params);
		self.$el.html(html);
		
		// Initialize handlers
		self.initHandlers();
		
		return self;
	}
	
	/**
	 * Initialize handlers
	 */
	,initHandlers : function(){
		var self = this;
		//TODO
		return self;
	}
});
