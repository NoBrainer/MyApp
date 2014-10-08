app.view.part.ResetPassword = Backbone.View.extend({
	
	el : ""
	
	/**
	 * Constructor
	 * @memberOf app.view.part.ResetPassword
	 */
	,initialize : function initialize(opts){
		opts = opts || {};
		
		if(opts.el){
			this.el = opts.el;
		}else{
			throw "must send el to app.view.part.ResetPassword constructor";
		}
		
		if(opts.username){
			this.username = opts.username;
		}else{
			throw "must send username to app.view.part.ResetPassword constructor";
		}
		
		if(opts.id){
			this.id = opts.id;
		}else{
			throw "must send id to app.view.part.ResetPassword constructor";
		}
	}
	
	/**
	 * Render
	 */
	,render : function render(){
		var self = this;
		
		// Render html from template
		var params = {
			username : self.username
		}
		var template = app.util.TemplateCache.get("#reset-password-template");
		var html = template(params);
		self.$el.append(html);
		
		// Initialize handlers
		self.initHandlers();
		
		return self;
	}
	
	/**
	 * Initialize handlers
	 */
	,initHandlers : function initHandlers(){
		var self = this;
		
		var $submitButton = $('#password_reset_submit');
		var $password = $('#password_reset_password');
		var $passwordConfirm = $('#password_reset_password_confirm');
		var $error = $('#password_reset_error');
		var $info = $('#password_reset_info');
		
		// Handle submitting
		$submitButton.on('click', function(e){
			// Clear previous messages
			$error.text("");
			$info.text("");
			
			// Get input
			var password = $password.val();
			var passwordConfirm = $passwordConfirm.val();
			
			// Validate input
			if(!password || !passwordConfirm || password !== passwordConfirm){
				$error.text("Passwords must match");
				return false;
			}
			
			// Send new password to server
			var ajaxOpts = {
				type : 'POST',
				url : "/api/users/resetPassword",
				contentType : 'application/json',
				dataType : 'json',
				data : JSON.stringify({
					password : password,
					id : self.id
				}),
				success : function(resp){
					var message = resp.message;
					if(resp.successful === true){
						$info.text("Password updated!")
					}else{
						$error.text(message);
						console.log(message);
						console.log(resp);
					}
				},
				error : function(resp){
					var message = "Error sending new password to server";
					$error.text(message);
					console.log(message);
					console.log(resp);
				}
			};
			$.ajax(ajaxOpts);
		});
		
		return self;
	}
});
