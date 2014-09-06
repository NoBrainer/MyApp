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
		
		// Render the page content
		var contentScaffold = new app.view.part.ContentScaffold({ el : self.el });
		contentScaffold.render();
		
		return self;
	}
});
