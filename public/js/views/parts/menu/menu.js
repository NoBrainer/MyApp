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
		
		// Setup the admin mode if the user is an admin
		self.setupAdminMode();
		
		// Click handler for edit button
		$('#edit_menu').on('click', function(e){
			alert("This function has not yet been implemented. Contact Vincent to update the menu: vincent.incarvite@gmail.com");
		});
		
		return self;
	}
	
	/**
	 * Setup the admin mode if the user is an admin
	 */
	,setupAdminMode : function setupAdminMode(){
		if(!app.util.Login.isAdmin()){
			return self;
		}
		var self = this;
		
		// Show admin controls
		self.$el.find('.admin_controls').show();
		
		return self;
	}
});
