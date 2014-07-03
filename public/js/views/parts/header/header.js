app.view.part.Header = Backbone.View.extend({
	
	el : '#header'
	
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
		
		// Initialize handlers
		return self.initHandlers();
	}
	
	/**
	 * Initialize handlers
	 */
	,initHandlers : function(){
		var self = this;
		
		return self
				.initModals()		// Initialize modals
				.initLoginStatus()	// Check if user is already logged in
		;
	}
	
	/**
	 * Initialize modal handlers
	 */
	,initModals : function(){
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
		var $settingsPassword = $('#settings_password');
		var $settingsPasswordConfirm = $('#settings_password_confirm');
		var $settingsError = $('#settings_error');
		var $settingsSuccess = $('#settings_success');
		var $updateSettingsButton = $('#update_settings_button');
		
		// Callback for attempting to login
		var attemptLogin = function(e){
			// Clear error message
			$loginError.text("");
			
			// Get username & password from input
			var username = $loginUsername.val();
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
				url : "https://localhost:3000/api/users/login", //TODO: build base url dynamically
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
		
		// Reset register modal on hide
		$registerModal.on('hide.bs.modal', function(e){
			// Reset fields
			$registerName.val("");
			$registerUsername.val("");
			$registerPassword.val("");
			$registerPasswordConfirm.val("");
		});
		
		// Callback for attempting to register
		var attemptRegister = function(e){
			// Clear error message
			$registerError.text("");
			
			// Get username & password from input
			var name = $registerName.val().trim();
			var username = $registerUsername.val();
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
				url : "https://localhost:3000/api/users/register", //TODO: build base url dynamically
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
			var password = $settingsPassword.val() || "";
			var passwordConfirm = $settingsPasswordConfirm.val() || "";
			
			// Validate input
			if(!name || name.trim() === ""){
				$settingsError.text("Please enter your name");
				return false;
			}
			
			// Validate password update
			var updatingPassword = !_.isEmpty(password) || !_.isEmpty(passwordConfirm);
			if(updatingPassword && password !== passwordConfirm){
				$settingsError.text("Passwords don't match");
				return false;
			}
			
			// Build updated data
			var updatedData = {
				name : name
			};
			if(updatingPassword){
				updatedData.password = password;
			}
			
			// Build ajax options
			var options = {
				type : 'POST',
				url : "https://localhost:3000/api/users/update", //TODO: build base url dynamically
				cache : false,
				contentType : 'application/json',
				dataType : 'json',
				data : JSON.stringify(updatedData)
			};
			options.success = function(resp){
				if(resp.successful){
					//TODO: make a date util
					// Display a success message
					var now = new Date();
					var hours = now.getHours();
					if(hours < 10){
						hours = "0"+hours;
					}
					var minutes = now.getMinutes();
					if(minutes < 10){
						minutes = "0"+minutes;
					}
					var seconds = now.getSeconds();
					if(seconds < 10){
						seconds = "0"+seconds;
					}
					var time = "hour:min:sec"
							.replace("hour", hours)
							.replace("min", minutes)
							.replace("sec", seconds);
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
		
		return self;
	}
	
	/**
	 * Initialize the site to have the user logged in if applicable
	 */
	,initLoginStatus : function(){
		var self = this;
		
		// Build ajax options
		var options = {
			type : 'GET',
			url : "https://localhost:3000/api/users/login", //TODO: build base url dynamically
			cache : false,
			contentType : 'application/json'
		};
		options.success = function(resp){
			if(resp.isLoggedIn){
				// Update the login status
				self.updateLogin(resp);
			}else{
				// Logout
				self.updateLogout();
			}
		};
		options.error = function(resp){
			alert("Failure to communicate with site. Try again later.");
		};
		
		// GET login status from the server
		$.ajax(options);
		
		return self;
	}
	
	/**
	 * After successful login, setup UI to be in a logged in state
	 */
	,updateLogin : function(resp){
		var self = this;
		
		// Extract data from the response
		resp = resp || {};
		var name = resp.name || "";
		var username = resp.username || "";
		var type = resp.type || "";
		
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
		
		if(type==='developer'){
			//TODO: developer-specific things
		}else if(type==='admin'){
			//TODO: admin-specific things
		}else if(type==='employee'){
			//TODO: employee-specific things
		}else{
			self.updateLogout();
		}
		
		return self;
	}
	
	/**
	 * Logout then setup UI to be in a logged out state
	 */
	,updateLogout : function(){
		var self = this;
		
		var $showOnLogout = $('.show_on_logout');
		var $showOnLogin = $('.show_on_login');
		var $userName = $('#user_name');
		
		// Build ajax options
		var options = {
			type : 'POST',
			url : "https://localhost:3000/api/users/logout", //TODO: build base url dynamically
			cache : false,
			contentType : 'application/json'
		};
		options.success = function(resp){
			if(resp.successful){
				// Reset header
				$showOnLogout.show();
				$showOnLogin.hide();
				$userName.text("");
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
