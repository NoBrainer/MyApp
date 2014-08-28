app.Router = Backbone.Router.extend({
	
	/**
	 * Constructor
	 */
	initialize : function(opts){
		this.route(/^.*/, "goDefault");
		this.route(/^home/, "goHome");
		this.route(/^employee/, "goEmployee");
		this.route(/^admin/, "goAdmin");
		this.route(/^resetPassword\/(.+)/, "goResetPassword");
		
		app.router = this;
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
	 * Reset Password page
	 */
	,goResetPassword : function(id){
		var self = this;
		console.log("password reset page");
		self.setupHeader();
		
		// Check if we are setup to reset the password
		var ajaxOpts = {
			type : 'GET',
			url : "/api/users/resetPassword/",
			success : function(resp){
				if(resp.isAble === true){
					// Render the password reset page
					var params = {
							mode : 'reset-password',
							username : resp.username,
							id : id
					};
					var page = new app.view.page.Home(params);
					page.render();
				}else{
					// Instead, go to the default page
					self.goDefault();
				}
			}
		};
		$.ajax(ajaxOpts);
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
