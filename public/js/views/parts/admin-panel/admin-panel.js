app.view.part.AdminPanel = Backbone.View.extend({
	
	el : ""
	
	/**
	 * Constructor
	 * @memberOf app.view.part.AdminPanel
	 */
	,initialize : function initialize(){
		this.defaultUser = {
			name : "Default Person",
			username : "fake@email.com",
			type : "admin",
			isConfirmed : false,
			isLocked : false
		};
	}
	
	/**
	 * Get the data then render
	 */
	,syncAndRender : function syncAndRender(){
		var self = this;
		
		// Build ajax options
		var options = {
			type : 'GET',
			url : "/api/users",
			cache : false,
			contentType : 'application/json'
		};
		options.success = function(resp){
			if(_.isNull(resp.error)){
				resp.users = _.isEmpty(resp.users) ? [self.defaultUser] : resp.users;
				self.render(resp.users);
			}else{
				self.renderError(resp.error);
			}
		};
		options.error = function(resp){
			self.renderError("Failure to communicate with site. Try again later.");
		};
		
		// Make the ajax call
		$.ajax(options);
		
		return self;
	}
	
	/**
	 * Render the error message
	 */
	,renderError : function renderError(error){
		var self = this;
		
		var message = error.message || error;
		alert(message);
		console.log(message);
		
		return self;
	}
	
	/**
	 * Render
	 */
	,render : function render(users){
		var self = this;
		
		// Get the table headers from the user data and sort them in the order we want them to appear
		var sortOrder = {
			name :			"1",
			username :		"2",
			type :			"3",
			isConfirmed :	"4",
			isLocked :		"5"
		};
		var tableHeaders = _.sortBy(Object.keys(users[0]), function(item){
			return sortOrder[item] || item;
		});
		
		// Sort the users to show 'pending-approval' users first
		users = _.sortBy(users, function(user){
			if(user.type === 'pending-approval'){
				return "0000000"+user.name;
			}else{
				return user.name;
			}
		});
		
		// Add the html to the page
		var params = {
			tableHeaders : tableHeaders,
			users : users
		}
		var template = app.util.TemplateCache.get("#admin-panel-template");
		var html = template(params);
		self.$el.html(html);
		
		// Initialize handlers
		self.initHandlers();
		
		return self;
	}
	
	/**
	 * Attempt to pre-approve a user
	 */
	,preApproveUser : function preApproveUser(username, type){
		var self = this;
		
		// Build ajax options
		var options = {
			type : 'POST',
			url : "/api/users/approve",
			cache : false,
			contentType : 'application/json',
			data : JSON.stringify({
				username : username,
				type : type
			})
		};
		options.success = function(resp){
			if(_.isNull(resp.error)){
				if(resp.approved){
					// Do nothing if the approval succeeded
				}else{
					// Alert the user if there's an error
					var message = resp.message || "No users updated";
					self.renderError(message);
				}
			}else{
				self.renderError(resp.error);
			}
		};
		options.error = function(resp){
			self.renderError("Failure to communicate with site. Try again later.");
		};
		
		// Make the ajax call
		$.ajax(options);
		
		return self;
	}
	
	/**
	 * Update the user's type
	 */
	,updateUserType : function updateUserType(username, type){
		var self = this;
		
		// Build ajax options
		var options = {
			type : 'POST',
			url : "/api/users/updateType",
			cache : false,
			contentType : 'application/json',
			data : JSON.stringify({
				username : username,
				type : type
			})
		};
		options.success = function(resp){
			if(_.isNull(resp.error)){
				if(resp.successful){
					// Do nothing if the approval succeeded
				}else{
					// Alert the user if there's an error
					var message = resp.message || "No users updated";
					self.renderError(message);
				}
			}else{
				self.renderError(resp.error);
			}
		};
		options.error = function(resp){
			self.renderError("Failure to communicate with site. Try again later.");
		};
		
		// Make the ajax call
		$.ajax(options);
		
		return self;
	}
	
	/**
	 * Initialize handlers
	 */
	,initHandlers : function initHandlers(){
		var self = this;
		
		// Pre-approve the user
		$('#pre_approve_user').on('click', function(e){
			// Get the username and type from the form
			var username = $('#pre_approve_user_email').val().trim();
			var type = $('#pre_approve_user_type').val().trim();

			// Make the call
			self.preApproveUser(username, type);
		});
		
		// Update the user type
		$('.user_type_updater').on('change', function(e){
			// Get the username and its new type from the table
			var $this = $(this);
			var type = $this.val();
			var username = $this.parents('tr').find('[field="username"]').text().trim();
			
			// Make the call
			self.updateUserType(username, type);
		});
		
		return self;
	}
});

/**
 * Factory method for the admin controls section
 * @memberOf app.view.part.AdminPanel
 */
app.view.part.AdminPanel.setup = function setup(el){
	if(!app.util.Login.isAdmin()){
		return false;
	}
	
	var adminPanel = new app.view.part.AdminPanel();
	adminPanel.setElement(el);
	adminPanel.syncAndRender();
	return adminPanel;
};
