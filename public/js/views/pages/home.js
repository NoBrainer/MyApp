app.view.page.Home = Backbone.View.extend({
	
	el : "#content"
	
	/**
	 * Constructor
	 * @memberOf app.view.page.Home
	 */
	,initialize : function initialize(){
		
	}
	
	/**
	 * Render
	 */
	,render : function render(){
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
	,setupEmployeeMode : function setupEmployeeMode(){
		var self = this;
		
		if(!app.util.Login.isEmployee()){
			app.router.routeHome();
			return self;
		}
		app.router.setPath("#employee");
		
		//TODO: do employee-specific things
		
		return self;
	}
	
	/**
	 * Setup admin mode
	 */
	,setupAdminMode : function setupAdminMode(){
		var self = this;
		
		if(!app.util.Login.isAdmin()){
			app.router.routeHome();
			return self;
		}
		app.router.setPath("#admin");
		
		// Setup the admin panel
		app.view.part.AdminPanel.setup("#admin_content");
		
		return self;
	}
});
