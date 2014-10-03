app.view.page.Home = Backbone.View.extend({
	
	el : "#content"
	
	/**
	 * Constructor
	 * @memberOf app.view.page.Home
	 */
	,initialize : function(){
		
	}
	
	/**
	 * Render
	 */
	,render : function(){
		var self = this;
		
		// Clear the page
		self.$el.empty();
		
		// Render the page content
		var contentScaffold = new app.view.part.ContentScaffold({ el : self.el });
		contentScaffold.render();
		
		return self;
	}
	
	/**
	 * Setup employee mode
	 */
	,setupEmployeeMode : function(){
		var self = this;
		
		//TODO: return self if not employee mode
		
		//TODO: do employee-specific things
		
		return self;
	}
	
	/**
	 * Setup admin mode
	 */
	,setupAdminMode : function(){
		var self = this;
		
		//TODO: return self if not admin mode
		
		// Show admin controls
		$('.admin_controls').show();
		
		return self;
	}
});
