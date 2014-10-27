app.Router = Backbone.Router.extend({
	
	defaults : {}
	
	/**
	 * Constructor
	 * @memberOf app.Router
	 */
	,initialize : function initialize(opts){
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
	,goDefault : function goDefault(){
		console.log("default page");
		this.navigate("#home", { trigger: true, replace: true });
	}
	
	/**
	 * Home page
	 */
	,goHome : function goHome(){
		console.log("home page");
		this.setupHeader();
		var page = new app.view.page.Home();
		page.render();
	}
	
	/**
	 * Employee page
	 */
	,goEmployee : function goEmployee(){
		console.log("employee page");
		this.setupHeader();
		var page = new app.view.page.Home();
		page.render();
		page.setupEmployeeMode();
	}
	
	/**
	 * Admin page
	 */
	,goAdmin : function goAdmin(){
		console.log("admin page");
		this.setupHeader();
		var page = new app.view.page.Home();
		page.render();
		page.setupAdminMode();
	}
	
	/**
	 * Reset Password page
	 */
	,goResetPassword : function goResetPassword(id){
		console.log("password reset page");
		var self = this;
		self.setupHeader();
		
		// Check if we are setup to reset the password
		var ajaxOpts = {
			type : 'GET',
			url : "/api/users/resetPassword/",
			complete : function(resp){
				resp = resp || {};
				if(resp.isAble === true){
					// Render the password reset page
					var params = {
							username : resp.username,
							id : id
					};
					var page = new app.view.page.ResetPassword(params);
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
	,setupHeader : function setupHeader(){
		var $header = $("#header");
		if($header.html().trim() === ""){
			var header = new app.view.part.Header();
			header.render();
		}
	}
	
	/**
	 * Helper function to be able to use: app.router.routeHome();
	 */
	,routeHome : function routeHome(){
		if(window.location.hash.match(/^#home/)){
			return;
		}
		this.navigate("#home", {
			trigger : true,
			replace : false
		});
	}
	
	/**
	 * Helper function to be able to use: app.router.routeEmployee();
	 */
	,routeEmployee : function routeEmployee(){
		if(window.location.hash.match(/^#employee/)){
			return;
		}
		this.navigate("#employee", {
			trigger : true,
			replace : false
		});
	}
	
	/**
	 * Helper function to be able to use: app.router.routeAdmin();
	 */
	,routeAdmin : function routeAdmin(){
		if(window.location.hash.match(/^#admin/)){
			return;
		}
		this.navigate("#admin", {
			trigger : true,
			replace : false
		});
	}
	
	/**
	 * Helper function to be able to use: app.router.routeResetPassword();
	 * @param id {String} - id string for resetting the password
	 */
	,routeResetPassword : function routeResetPassword(id){
		if(window.location.hash.match(/^#resetPassword/)){
			return;
		}
		this.navigate("#resetPassword/"+id, {
			trigger : true,
			replace : false
		});
	}
	
	/**
	 * Helper function to set the path in the browser.
	 * @param hash {String} - hash of the path to set
	 * @param replace {Boolean} - (optional) whether or not to replace the previous url in browser history (defaults to false)
	 */
	,setPath : function setPath(hash, replace){
		replace = (replace===true);
		this.navigate(hash, {
			trigger : false,
			replace : replace
		});
	}
	
	/**
	 * Helper function to reload the page
	 */
	,reloadPage : function reloadPage(){
		var hash = window.location.hash;
		this.navigate("junkUrlThatIWouldNeverUse", {
			trigger : false,
			replace : true
		});
		this.navigate(hash, {
			trigger : true,
			replace: true
		});
	}
});
