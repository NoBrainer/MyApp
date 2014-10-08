app.view.part.Menu = Backbone.View.extend({
	
	el : ""
	
	/**
	 * Constructor
	 * @memberOf app.view.part.Menu
	 */
	,initialize : function initialize(){
		
	}
	
	/**
	 * Render
	 */
	,render : function render(){
		var self = this;
		
		// Add the html to the page
		var params = {}
		var template = app.util.TemplateCache.get("#menu-template");
		var html = template(params);
		self.$el.html(html);
		
		// Initialize handlers
		self.initHandlers();
		
		return self;
	}
	
	/**
	 * Initialize handlers
	 */
	,initHandlers : function initHandlers(){
		var self = this;
		//TODO
		return self;
	}
});
