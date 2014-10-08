app.view.part.AdminPanel = Backbone.View.extend({
	
	el : ""
	
	/**
	 * Constructor
	 * @memberOf app.view.part.AdminPanel
	 */
	,initialize : function(){
		
	}
	
	/**
	 * Get the data
	 */
	,sync : function(){
		var self = this;
		//TODO
		return self;
	}
	
	/**
	 * Render
	 */
	,render : function(){
		var self = this;
		
		//TODO: sync first
		
		// Add the html to the page
		var params = {}
		var template = app.util.TemplateCache.get("#admin-panel-template");
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
		var self = this;
		//TODO
		return self;
	}
});

/**
 * Factory method for the admin controls section
 * @memberOf app.view.part.AdminPanel
 */
app.view.part.AdminPanel.setup = function(el){
	if(!app.util.Login.isAdmin()){
		return false;
	}
	
	var adminPanel = new app.view.part.AdminPanel();
	adminPanel.setElement(el);
	adminPanel.render();
	return adminPanel;
};
