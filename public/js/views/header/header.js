app.view.Header = Backbone.View.extend({
	
	el : "#header"
	
	/**
	 * Constructor
	 */
	,initialize : function(){
		
	}
	
	/**
	 * Render
	 */
	,render : function(){
		// Render html from template
		var params = {}
		var template = app.util.TemplateCache.get("#header-template");
		var html = template(params);
		this.$el.html(html);
		
		this.initHandlers();
	}
	
	/**
	 * Initialize handlers
	 */
	,initHandlers : function(){
		
	}
});
