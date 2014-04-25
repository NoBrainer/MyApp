app.view.page.Admin = Backbone.View.extend({
	
	el : "#content"
	
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
		
		// Clear the page
		self.$el.empty();
		
		// Render the pieces of the page
		self.$el.append("This is the admin page");
		
		return self;
	}
});
