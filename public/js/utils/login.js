app.util.Login = {
		
	/**
	 * Checks if the login status is employee or higher.
	 * @memberOf app.util.Login
	 */
	isDeveloper : function isDeveloper(){
		if(app.state.login.match(/^developer/i)){
			return true;
		}
		return false;
	}
	
	/**
	 * Checks if the login status is admin or higher.
	 * @memberOf app.util.Login
	 */
	,isAdmin : function isAdmin(){
		if(app.state.login.match(/^admin/i) || app.util.Login.isDeveloper()){
			return true;
		}
		return false;
	}
	
	/**
	 * Checks if the login status is employee or higher.
	 * @memberOf app.util.Login
	 */
	,isEmployee : function isEmployee(){
		if(app.state.login.match(/^employee$/i) || app.util.Login.isAdmin()){
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
};

