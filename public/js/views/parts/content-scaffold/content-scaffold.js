app.view.part.ContentScaffold = Backbone.View.extend({
	
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
		
		// Add the scaffold to the html content
		var params = {}
		var template = app.util.TemplateCache.get("#content-scaffold-template");
		var html = template(params);
		self.$el.html(html);
		
		// Populate the scaffold with its content
		self.populate();
		
		return self;
	}
	
	/**
	 * Populate the scaffold with its content
	 */
	,populate : function(){
		var self = this;
		
		// Jumbotron
		var jumbotron = new app.view.part.Jumbotron({ el : "#jumbotron_content" });
		jumbotron.render();
		
		// Social media
		var socialMedia = new app.view.part.SocialMedia({ el : "#social_media_content" });
		socialMedia.render();
		
		// News section
		var news = new app.view.part.News({ el : "#news_content" });
		news.render();
		
		// Schedule section
		var schedule = new app.view.part.Schedule({ el : "#schedule_content" });
		schedule.render();
		
		// Menu section
		var menu = new app.view.part.Menu({ el : "#menu_content" });
		menu.render();
		
		return self;
	}
});
