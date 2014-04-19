app.Router = Backbone.Router.extend({
	
	/**
	 * Constructor
	 */
	initialize : function(opts){
		this.route(/^.*/, "goDefault");
		this.route(/^home/, "goHome");
		this.route(/^employee/, "goEmployee");
		this.route(/^admin/, "goAdmin");
	}
	
	/**
	 * Default page
	 */
	,goDefault : function(){
		console.log("default page");
		this.navigate("#home", { trigger: true, replace: true });
	}
	
	/**
	 * Default page
	 */
	,goHome : function(){
		console.log("home page");
		
		var header = new app.view.Header();
		header.render();
	}
	
	/**
	 * Employee page
	 */
	,goEmployee : function(){
		console.log("employee page");
	}
	
	/**
	 * Admin page
	 */
	,goAdmin : function(){
		console.log("admin page");
	}
});
