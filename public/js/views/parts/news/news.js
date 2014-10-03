app.view.part.News = Backbone.View.extend({
	
	el : ""
	
	/**
	 * Constructor
	 * @memberOf app.view.part.News
	 */
	,initialize : function(){
		this.stubData = [
			{
				postedDate : new Date(1410045634906),
				title :	"Soft Opening",
				body :	"Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin " +
						"commodo. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum " +
						"nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus."
			},
			{
				postedDate : new Date(1410045134906),
				title :	"Grand Opening",
				body :	"Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin " +
						"commodo. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum " +
						"nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus."
			}
		];
	}
	
	/**
	 * Get the data
	 */
	,sync : function(){
		var self = this;
		
		//TODO: make a database call rather than using the stub data
		
		return self;
	}
	
	/**
	 * Render
	 */
	,render : function(){
		var self = this;
		
		//TODO: sync first
		
		// Add the html to the page
		var params = {
			news : self.data || self.stubData
		}
		var template = app.util.TemplateCache.get("#news-template");
		var html = template(params);
		self.$el.html(html);
		
		// Initialize handlers
		self.initHandlers();
		
		return self;
	}
	
	/**
	 * Initialize handlers
	 */
	,initHandlers : function(){
		var self = this;
		
		// Add toggle functionality to the truncated text
		$('.news_toggle').on('click', function(e){
			$(this).parent().find('.news_toggle').toggle();
		});
		
		return self;
	}
});
