app.view.part.Header = Backbone.View.extend({
	
	el : "#header"
	
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
		var template = app.util.TemplateCache.get("#header-template");
		var html = template(params);
		self.$el.html(html);
		
		// Render login modal
		var loginModalTemplate = app.util.TemplateCache.get("#login-modal-template");
		$("#header_right .modal_storage").append(loginModalTemplate({}));
		
		// Initialize handlers
		self.initHandlers();
		
		return self;
	}
	
	/**
	 * Initialize handlers
	 */
	,initHandlers : function(){
		// Callback for attempting to login
		var attemptLogin = function(e){
			var $loginError = $("#login_error");
			var $loginUsername = $("#login_username");
			var $loginPassword = $("#login_password");
			
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
			
			// POST login to the server
			var options = {
				type : "POST",
				url : "https://localhost:3000/api/users/login", //TODO: build base url dynamically
				cache : false,
				contentType : "application/json",
				dataType : "json",
				data : JSON.stringify({
					username : username,
					password : password
				})
			};
			$.ajax(options)
				.done(function(resp){
					if(resp.successful){
						// Reset modal
						$("#login_modal").modal("hide");
						$loginUsername.text("");
						$loginPassword.text("");
						
						//TODO: set to login state
					}else if(resp.message){
						$loginError.text(resp.message);
					}else{
						$loginError.text("Unexpected response from server");
					}
				})
				.fail(function(resp){
					$loginError.text("Failure to communicate with site. Try again later.")
				});
			
			return false;
		};
		
		// Trigger login attempt from clicking the login button or pressing enter
		$("#login_button").on('click', attemptLogin);
		$(".login_enter").on('keyup', function(e){
			if(e.keyCode === 13){
				attemptLogin();
				return false;
			}
		})
	}
});
