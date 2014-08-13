app.view.part.SampleContent = Backbone.View.extend({
	
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
		var template = app.util.TemplateCache.get("#sample-content-template");
		var html = template(params);
		self.$el.append(html);
		
		// Add an app list to its placeholder div
		var appList = new app.view.part.AppList({ el : "#app-list-placeholder" });
		appList.render();
		
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
