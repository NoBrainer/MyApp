app.view.part.Header = Backbone.View.extend({
	
	el : '#header'
	
	/**
	 * Constructor
	 * @memberOf app.view.part.Header
	 */
	,initialize : function initialize(){
		
	}
	
	/**
	 * Render
	 */
	,render : function render(){
		var self = this;
		
		// Render html from template
		var params = {}
		var template = app.util.TemplateCache.get('#header-template');
		var html = template(params);
		self.$el.html(html);
		
		// Render login modal
		var loginModalTemplate = app.util.TemplateCache.get('#login-modal-template');
		$('#modal_storage').append(loginModalTemplate({}));
		
		// Render register modal
		var registerModalTemplate = app.util.TemplateCache.get('#register-modal-template');
		$('#modal_storage').append(registerModalTemplate({}));
		
		// Render settings modal
		var settingsModalTemplate = app.util.TemplateCache.get('#settings-modal-template');
		$('#modal_storage').append(settingsModalTemplate({}));
		
		// Render forgot password modal
		var forgotPasswordModalTemplate = app.util.TemplateCache.get('#forgot-password-modal-template');
		$('#modal_storage').append(forgotPasswordModalTemplate({}));
		
		// Initialize handlers
		return self.initHandlers();
	}
	
	/**
	 * Initialize handlers
	 */
	,initHandlers : function initHandlers(){
		return this
				.initModals()		// Initialize modals
				.updateLogin()		// Check if user is already logged in
		;
	}
	
	/**
	 * Initialize modal handlers
	 */
	,initModals : function initModals(){
		var self = this;
		
		// UI parts for header
		var $userLogout = $('#user_logout');
		
		// UI parts for login modal
		var $loginModal = $('#login_modal');
		var $loginUsername = $('#login_username');
		var $loginPassword = $('#login_password');
		var $loginError = $('#login_error');
		var $loginButton = $('#login_button');
		var $forgotPassword = $('#forgot_password');
		var $register = $('#register');
		
		// UI parts for register modal
		var $registerModal = $('#register_modal');
		var $registerName = $('#register_name');
		var $registerUsername = $('#register_username');
		var $registerPassword = $('#register_password');
		var $registerPasswordConfirm = $('#register_password_confirm');
		var $registerError = $('#register_error');
		var $registerButton = $('#register_button');
		
		// UI parts for settings modal
		var $settingsModal = $('#settings_modal');
		var $settingsName = $('#settings_name');
		var $settingsUsername = $('#settings_username');
		var $settingsOldPassword = $('#settings_old_password');
		var $settingsPassword = $('#settings_password');
		var $settingsPasswordConfirm = $('#settings_password_confirm');
		var $settingsError = $('#settings_error');
		var $settingsSuccess = $('#settings_success');
		var $updateSettingsButton = $('#update_settings_button');
		
		// UI parts for forgot password modal
		var $forgotPasswordModal = $('#forgot_password_modal');
		var $forgotPasswordUsername = $('#forgot_password_username');
		var $forgotPasswordError = $('#forgot_password_error');
		var $forgotPasswordSuccess = $('#forgot_password_success');
		var $forgotPasswordButton = $('#forgot_password_button');
		
		// Callback for attempting to login
		var attemptLogin = function(e){
			// Clear error message
			$loginError.text("");
			
			// Get username & password from input
			var username = $loginUsername.val().trim();
			var password = $loginPassword.val();
			
			// Validate input
			if(!username || username.trim() === ""){
				$loginError.text("Please enter your username");
				return false;
			}else if(!password || password.trim() === ""){
				$loginError.text("Please enter your password");
				return false;
			}
			
			// Build ajax options
			var options = {
				type : 'POST',
				url : "/api/users/login",
				cache : false,
				contentType : 'application/json',
				dataType : 'json',
				data : JSON.stringify({
					username : username,
					password : password
				})
			};
			options.success = function(resp){
				if(resp.successful){
					// Hide the modal and update login state
					$loginModal.modal('hide');
					self.updateLogin(resp);
				}else if(resp.message){
					$loginError.text(resp.message);
				}else{
					$loginError.text("Unexpected response from server");
				}
			};
			options.error = function(resp){
				$loginError.text("Failure to communicate with site. Try again later.");
			};
			
			// POST login to the server
			$.ajax(options);
			
			return false;
		};
		
		// Trigger login attempt from clicking the login button or pressing enter
		$loginButton.on('click', _.bind(attemptLogin, self));
		$('.login_enter').on('keyup', function(e){
			if(e.keyCode === 13){
				return attemptLogin();
			}
		});
		
		// Trigger logout
		$userLogout.on('click', function(e){
			self.updateLogout();
			return false;
		});
		
		// Reset login modal on hide
		$loginModal.on('hide.bs.modal', function(e){
			// Reset fields
			$loginUsername.val("");
			$loginPassword.val("");
			$loginError.text("");
		});
		
		// Register modal
		$register.on('click', function(e){
			// Hide the login modal & show the register modal
			$loginModal.modal('hide');
			$registerModal.modal('show');
		});
		
		// Password reset modal
		$forgotPassword.on('click', function(e){
			// Hide the login modal & show the password reset modal
			$loginModal.modal('hide');
			$forgotPasswordModal.modal('show');
		});
		
		// Reset register modal on hide
		$registerModal.on('hide.bs.modal', function(e){
			// Reset fields
			$registerName.val("");
			$registerUsername.val("");
			$registerPassword.val("");
			$registerPasswordConfirm.val("");
			$registerError.text("");
		});
		
		// Callback for attempting to register
		var attemptRegister = function(e){
			// Clear error message
			$registerError.text("");
			
			// Get username & password from input
			var name = $registerName.val().trim();
			var username = $registerUsername.val().trim();
			var password = $registerPassword.val();
			var passwordConfirm = $registerPasswordConfirm.val();
			
			// Validate input
			if(!name || name.trim() === ""){
				$registerError.text("Please enter your name");
				return false;
			}else if(!username || username.trim() === ""){
				$registerError.text("Please enter your username");
				return false;
			}else if(!username.match(/^[\w\.\-\+]+[@][\w\.\-\+]+\.[\w\.\-\+]+$/)){
				$registerError.text("Please enter a valid email address for your username");
				return false;
			}else if(!password || password.trim() === ""){
				$registerError.text("Please enter your password");
				return false;
			}else if(!passwordConfirm || passwordConfirm.trim() === ""){
				$registerError.text("Please enter your password twice");
				return false;
			}else if(password !== passwordConfirm){
				$registerError.text("Passwords don't match");
				return false;
			}
			
			// Build ajax options
			var options = {
				type : 'POST',
				url : "/api/users/register",
				cache : false,
				contentType : 'application/json',
				dataType : 'json',
				data : JSON.stringify({
					name : name,
					username : username,
					password : password
				})
			};
			options.success = function(resp){
				if(resp.successful){
					// Hide the modal
					$registerModal.modal('hide');
				}else if(resp.message){
					$registerError.text(resp.message);
				}else if(resp.error && typeof resp.error === "string"){
					$registerError.text(resp.error);
				}else{
					$registerError.text("Unexpected response from server");
				}
			};
			options.error = function(resp){
				$registerError.text("Failure to communicate with site. Try again later.");
			};
			
			// POST registration to the server
			$.ajax(options);
			
			return false;
		};
		
		// Trigger register attempt from clicking the register button or pressing enter
		$registerButton.on('click', _.bind(attemptRegister, self))
		$('.register_enter').on('keyup', function(e){
			if(e.keyCode === 13){
				return attemptRegister();
			}
		});
		
		// Callback for attempting to update settings
		var attemptUpdateSettings = function(e){
			// Clear error/success messages
			$settingsError.text("");
			$settingsSuccess.text("");
			
			// Get name & password from input
			var name = $settingsName.val().trim();
			var oldPassword = $settingsOldPassword.val() || "";
			var password = $settingsPassword.val() || "";
			var passwordConfirm = $settingsPasswordConfirm.val() || "";
			
			// Validate input
			if(!name || name.trim() === ""){
				$settingsError.text("Please enter your name");
				return false;
			}
			
			// Validate password update
			var updatingPassword = !_.isEmpty(oldPassword) || !_.isEmpty(password) || !_.isEmpty(passwordConfirm);
			if(updatingPassword){
				if(password !== passwordConfirm){
					$settingsError.text("Passwords don't match");
					return false;
				}else if(_.isEmpty(oldPassword)){
					$settingsError.text("Old password is required to update your password");
					return false;
				}else if(_.isEmpty(password)){
					$settingsError.text("New password is required to update your password");
					return false;
				}
			}
			
			// Build updated data
			var updatedData = {
				name : name
			};
			if(updatingPassword){
				updatedData.oldPassword = oldPassword;
				updatedData.password = password;
			}
			
			// Build ajax options
			var options = {
				type : 'POST',
				url : "/api/users/update",
				cache : false,
				contentType : 'application/json',
				dataType : 'json',
				data : JSON.stringify(updatedData)
			};
			options.success = function(resp){
				if(resp.successful){
					var now = new Date(Date.now());
					var time = app.util.Date.toString(now);
					var msg = "Updated [_TIME_]".replace(/_TIME_/, time);
					$settingsSuccess.text(msg);
				}else if(resp.message){
					$settingsError.text(resp.message);
				}else if(resp.error && typeof resp.error === "string"){
					$settingsError.text(resp.error);
				}else{
					$settingsError.text("Unexpected response from server");
				}
			};
			options.error = function(resp){
				$settingsError.text("Failure to communicate with site. Try again later.");
			};
			
			// POST registration to the server
			$.ajax(options);
			
			return false;
		};
		
		// Trigger settings update attempt from clicking the update button or pressing enter
		$updateSettingsButton.on('click', _.bind(attemptUpdateSettings, self));
		$('.settings_enter').on('keyup', function(e){
			if(e.keyCode === 13){
				return attemptUpdateSettings();
			}
		});
		
		// Reset settings modal on hide
		$settingsModal.on('hide.bs.modal', function(e){
			// Reset fields & messages
			$settingsOldPassword.val("");
			$settingsPassword.val("");
			$settingsPasswordConfirm.val("");
			$settingsError.text("");
			$settingsSuccess.text("");
		});
		
		// Reset password reset modal on hide
		$forgotPasswordModal.on('hide.bs.modal', function(e){
			// Reset fields
			$forgotPasswordUsername.val("");
			$forgotPasswordError.text("");
			$forgotPasswordSuccess.text("");
		});
		
		// Callback for attempting to reset the password
		var attemptForgottenPasswordReset = function(){
			// Clear messages
			$forgotPasswordError.text("");
			$forgotPasswordSuccess.text("");
			
			// Get username from input
			var username = $forgotPasswordUsername.val().trim();
			
			// Validate input
			if(!username.match(/^[\w\.\-\+]+[@][\w\.\-\+]+\.[\w\.\-\+]+$/)){ //TODO: make a regex util
				$forgotPasswordError.text("Please enter a valid email address for your username");
				return false;
			}
			
			// Build ajax options
			var options = {
				type : 'POST',
				url : "/api/users/startPasswordReset",
				cache : false,
				contentType : 'application/json',
				dataType : 'json',
				data : JSON.stringify({
					username : username
				})
			};
			options.success = function(resp){
				if(resp.sentToUser){
					// Show a message for the user
					var successMessage = "<br/>" +
							"Email sent!<br/><br/>" +
							"IMPORTANT: You must keep this browser tab open in order to reset your password.";
					$forgotPasswordSuccess.html(successMessage);
				}else if(resp.message){
					$forgotPasswordError.text(resp.message);
				}else if(resp.error && typeof resp.error === "string"){
					$forgotPasswordError.text(resp.error);
				}else{
					$forgotPasswordError.text("Unexpected response from server");
				}
			};
			options.error = function(resp){
				$forgotPasswordError.text("Failure to communicate with site. Try again later.");
			};
			
			// POST password reset to the server
			$.ajax(options);
			
			return false;
		};
		
		// Trigger password reset attempt from clicking the button or pressing enter
		$forgotPasswordButton.on('click', _.bind(attemptForgottenPasswordReset, self));
		$('.forgot_password_enter').on('keyup', function(e){
			if(e.keyCode === 13){
				return attemptForgottenPasswordReset();
			}
		});
		
		return self;
	}
	
	/**
	 * After successful login, setup UI to be in a logged in state
	 */
	,updateLogin : function updateLogin(resp){
		var self = this;
		resp = resp || {};
		
		// If a response was passed, then update app.state.login
		if(!_.isEmpty(resp)){
			app.state.login.name = resp.name;
			app.state.login.username = resp.username;
			app.state.login.type = resp.type;
		}
		
		// Extract data from app.state.login
		var name = app.state.login.name;
		var username = app.state.login.username;
		var type = app.state.login.type;
		
		// Logout if there is no type
		if(_.isEmpty(type)){
			return self.updateLogout();
		}
		
		var $showOnLogout = $('.show_on_logout');
		var $showOnLogin = $('.show_on_login');
		var $userName = $('#user_name');
		var $settingsName = $('#settings_name');
		var $settingsUsername = $('#settings_username');
		
		// Update header
		$showOnLogout.hide();
		$showOnLogin.show();
		$userName.text(username || "???");
		
		// Update settings modal
		$settingsName.val(name || "");
		$settingsUsername.val(username || "");
		
		// Update the route depending on the login type
		app.util.Login.routeToMax();
		
		return self;
	}
	
	/**
	 * Logout then setup UI to be in a logged out state
	 */
	,updateLogout : function updateLogout(){
		var self = this;
		
		// Update the login state
		app.state.login.name = "";
		app.state.login.username = "";
		app.state.login.type = "";
		
		var $showOnLogout = $('.show_on_logout');
		var $showOnLogin = $('.show_on_login');
		var $userName = $('#user_name');
		
		// Build ajax options
		var options = {
			type : 'POST',
			url : "/api/users/logout",
			cache : false,
			contentType : 'application/json'
		};
		options.success = function(resp){
			if(resp.successful){
				// Reset header and go home
				$showOnLogout.show();
				$showOnLogin.hide();
				$userName.text("");
				if(!window.location.hash.match(/resetPassword/)){
					app.router.routeHome();
				}
			}else if(resp.message){
				alert(resp.message);
			}else{
				alert("Unexpected response from server");
			}
		};
		options.error = function(resp){
			alert("Failure to communicate with site. Try again later.");
		};
		
		// POST logout to the server
		$.ajax(options);
		
		return self;
	}
});
