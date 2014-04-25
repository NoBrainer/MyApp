app.view.part.AppList = Backbone.View.extend({
	
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
		
		// Render html from template
		var params = {}
		var template = app.util.TemplateCache.get("#app-list-template");
		var html = template(params);
		self.$el.append(html);
		
		// Initialize handlers
		self.initHandlers();
		
		return self;
	}
	
	/**
	 * Initialize handlers
	 */
	,initHandlers : function(){
		
	}
});
