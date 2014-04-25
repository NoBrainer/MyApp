app.view.page.Home = Backbone.View.extend({
	
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
		var appList = new app.view.part.AppList({ el : self.el });
		
		return self;
	}
});
