app.util.Login = {
		
	/**
	 * Checks if the login status is employee or higher.
	 * @memberOf app.util.Login
	 */
	isDeveloper : function isDeveloper(){
		if(app.state.login.type.match(/^developer/i)){
			return true;
		}
		return false;
	}
	
	/**
	 * Checks if the login status is admin or higher.
	 * @memberOf app.util.Login
	 */
	,isAdmin : function isAdmin(){
		if(app.state.login.type.match(/^admin/i) || app.util.Login.isDeveloper()){
			return true;
		}
		return false;
	}
	
	/**
	 * Checks if the login status is employee or higher.
	 * @memberOf app.util.Login
	 */
	,isEmployee : function isEmployee(){
		if(app.state.login.type.match(/^employee$/i) || app.util.Login.isAdmin()){
			return true;
		}
		return false;
	}
	
	/**
	 * Route to the maximum allowed path based on login status.
	 * @memberOf app.util.Login
	 */
	,routeToMax : function routeToMax(){
		if(app.util.Login.isAdmin()){
			app.router.routeAdmin();
		}else if(app.util.Login.isEmployee()){
			app.router.routeEmployee();
		}else{
			app.router.routeHome();
		}
	}
	
	/**
	 * Check the login state and update app.state accordingly
	 * @memberOf app.util.Login
	 */
	,checkLoginState : function checkLoginState(){
		// Build ajax options
		var options = {
			type : 'GET',
			url : "/api/users/login",
			cache : false,
			contentType : 'application/json'
		};
		options.success = function(resp){
			if(resp.isLoggedIn){
				// Update the login status
				app.state.login.type = resp.type || "";
				app.state.login.name = resp.name || "";
				app.state.login.username = resp.username || "";
			}
		};
		options.error = function(resp){
			alert("Failure to communicate with site. Try again later.");
		};
		
		// GET login status from the server
		return $.ajax(options);
	}
};

