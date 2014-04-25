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
		this.setupHeader();
		var page = new app.view.page.Home();
		page.render();
	}
	
	/**
	 * Employee page
	 */
	,goEmployee : function(){
		console.log("employee page");
		this.setupHeader();
		var page = new app.view.page.Employee();
		page.render();
	}
	
	/**
	 * Admin page
	 */
	,goAdmin : function(){
		console.log("admin page");
		this.setupHeader();
		var page = new app.view.page.Admin();
		page.render();
	}
	
	/**
	 * Setup the header
	 */
	,setupHeader : function(){
		var $header = $("#header");
		if($header.html().trim() === ""){
			var header = new app.view.part.Header();
			header.render();
		}
	}
});
