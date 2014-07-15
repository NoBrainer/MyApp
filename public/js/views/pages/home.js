app.view.page.Home = Backbone.View.extend({
	
	el : "#content"
	
	/**
	 * Constructor
	 */
	,initialize : function(opts){
		opts = opts || {};
		
		//TODO: make a separate view for password reset
		this.mode = opts.mode || 'default';
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
		
		if(self.mode === 'reset-password'){
			// Render the reset-password pieces of the page
			var resetPassword = new app.view.part.ResetPassword({
				el : self.el,
				username : self.username,
				id : self.id
			});
		}else{
			// Render the default pieces of the page
			var appList = new app.view.part.AppList({ el : self.el });
		}
		
		return self;
	}
});
