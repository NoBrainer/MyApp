app.view.page.ResetPassword = Backbone.View.extend({
	
	el : "#content"
	
	/**
	 * Constructor
	 */
	,initialize : function(opts){
		opts = opts || {};
		
		// Get values from opts
		this.username = opts.username || "invalid_username";
		this.id = opts.id || null;
	}
	
	/**
	 * Render
	 */
	,render : function(){
		var self = this;
		
		// Clear the page
		self.$el.empty();
		
		// Render the reset-password pieces of the page
		var resetPassword = new app.view.part.ResetPassword({
			el : self.el,
			username : self.username,
			id : self.id
		});
		resetPassword.render();
		
		return self;
	}
});
