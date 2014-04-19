App.Router = Backbone.Router.extend({
	
	/**
	 * Constructor
	 */
	initialize : function(opts){
		this.route(/^.*/, "goDefault");
		this.route(/^employee/, "goEmployee");
		this.route(/^admin/, "goAdmin");
	}
	
	/**
	 * Default page
	 */
	,goDefault : function(){
		console.log("default page");
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
