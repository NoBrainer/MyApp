app.view.part.Schedule = Backbone.View.extend({
	
	el : ""
	
	/**
	 * Constructor
	 * @memberOf app.view.part.Schedule
	 */
	,initialize : function initialize(){
		// Helper function to create random data for the stub data
		var names = ["Devin", "Bob", "Jennifer", "Carl", "Lauren", "Scott"];
		var shifts = ["10am-close", "12pm-4pm", "4pm-midnight", "2pm-8pm"];
		var randomizeShifts = function(){
			var arr = [];
			names = _.shuffle(names);
			shifts = _.shuffle(shifts);
			for(var i=0; i<4; i++){
				var str = names[i]+" "+shifts[i];
				arr.push(str);
			}
			return arr;
		};
		
		// Build the stub data
		var currentDay = app.util.Date.startOfDay();
		this.stubData = { items : [] };
		for(var i=0; i<7; i++){
			// Create the object and add it to the stub data
			var obj = {};
			obj.label = app.util.Date.toStringShort(currentDay);
			obj.date = currentDay;
			obj.people = randomizeShifts();
			this.stubData.items.push(obj);
			
			// Switch to the next day
			app.util.Date.nextDay(currentDay);
		}
		
		// Stub data used if no users are returned
		self.stubUser = {
				username : "",
				type : "",
				name : "No Users Found"
		};
	}
	
	/**
	 * Get data then render
	 */
	,syncAndRender : function syncAndRender(){
		var self = this;
		
		// Callback to render once ready
		var numCalls = 2;
		var renderIfReady = function renderIfReady(){
			numCalls--;
			if(numCalls === 0){
				self.render();
			}
		};
		
		// Build ajax options for getting the user list
		var userOpts = {
			type : 'GET',
			url : "/api/users",
			cache : false,
			contentType : 'application/json'
		};
		userOpts.success = function(resp){
			if(_.isNull(resp.error)){
				self.users = _.isEmpty(resp.users) ? [self.stubUser] : resp.users;
				renderIfReady();
			}else{
				self.renderError(resp.error);
			}
		};
		userOpts.error = function(resp){
			self.renderError("Failure to communicate with site. Try again later.");
		};
		
		// Build ajax options for getting the schedule list
		var scheduleOpts = {
			type : 'POST',
			url : "/api/schedule",
			cache : false,
			contentType : 'application/json',
			data : JSON.stringify({
					startDate : app.util.Date.startOfDay(),	//TODO: change the startDate
					endDate : app.util.Date.nextDay(app.util.Date.startOfDay(), 6)
			})
		};
		scheduleOpts.success = function(resp){
			if(_.isNull(resp.error)){
				self.schedule = _.isEmpty(resp.schedule) ? [] : resp.schedule;
				renderIfReady();
			}else{
				self.renderError(resp.error);
			}
		};
		scheduleOpts.error = function(resp){
			self.renderError("Failure to communicate with site. Try again later.");
		};
		
		// Make the ajax calls
		$.ajax(userOpts);
		$.ajax(scheduleOpts);
		
		return self;
	}
	
	/**
	 * Render
	 */
	,render : function render(){
		var self = this;
		
		// Massage the data
		var scheduleList = _.map(self.schedule, function(item){
			var date = new Date(item.date);
			item.label = app.util.Date.toStringShort(date);
			return item;
		});
		
		// Add the html to the page
		var params = {
				scheduleList : scheduleList
		};
		var template = app.util.TemplateCache.get("#schedule-template");
		var html = template(params);
		self.$el.html(html);
		
		// Initialize handlers
		self.initHandlers();
		
		return self;
	}
	
	/**
	 * Render error
	 */
	,renderError : function render(error){
		var self = this;
		
		var message = error.message || error;
		alert(message);
		console.log(message);
		
		return self;
	}
	
	/**
	 * Initialize handlers
	 */
	,initHandlers : function initHandlers(){
		var self = this;
		
		// Setup the admin mode if the user is an admin
		self.setupAdminMode();
		
//		//TODO: remove this if we settle on the table version
//		// Click handler to show the expanded version
//		self.$el.find('.expanding_btn').on('click', function(){
//			var $this = $(this);
//			var target = $this.attr('target');
//			var $placeholder = $(target);
//			
//			if(!$this.hasClass('expanded')){
//				$placeholder.width($this.width());
//				$placeholder.height($this.height());
//			}
//			
//			$this.toggleClass('expanded');
//			$placeholder.toggle();
//		});
//		
//		// Click handler to close the expanded version
//		self.$el.find('.expanded_btn').on('click', function(){
//			$(this).hide();
//		});
		
		return self;
	}
	
	/**
	 * Setup the admin mode if the user is an admin
	 */
	,setupAdminMode : function setupAdminMode(){
		if(!app.util.Login.isAdmin()){
			return self;
		}
		var self = this;
		
		// Show admin controls
		self.$el.find('.admin_controls').show();
		
		// Generate the edit form
		self.generateEditForm();
		
		// Handler for toggling edit-mode
		$('#edit_schedule').on('click', function(e){
			self.$el.find('.admin_edit_toggle').toggle();
		});
		
		// Handler for canceling edits
		$('#cancel_schedule').on('click', function(e){
			self.$el.find('.admin_edit_toggle').toggle();
		});
		
		// Handler for refreshing the page
		$('#refresh_schedule').on('click', function(e){
			app.router.reloadPage();
		});
		
		// Handler for applying changes
		$('#apply_schedule_changes').on('click', function(e){
			$.when(self.applyChanges())
				.done(function(resp){
					alert("Success!");
				})
				.fail(function(resp){
					console.log("Failed to save changes");
					console.log(resp);
					alert("Failed to save changes. Please try again.");
				});
		});
		
		// Handler for removing people from the schedule (NOTE: this is overridden when you add entries)
		self.$el.find('.remove_person').off().on('click', function(e){
			var $target = $(this);
			var $entry = $target.parents('.schedule_edit_entry');
			$entry.remove();
		});
		
		// Handler for adding people to the schedule
		$('#schedule_add_person').on('click', function(e){
			var $this = $(this);
			
			self.$el.queue(function(){
				// Build the html
				var entryTemplate = app.util.TemplateCache.get("#schedule-edit-entry-template");
				var person = {
						username : "",
						name : "",
						shift : ""
				};
				var params = {
						entry : person,
						users : self.users
				};
				var entryHtml = entryTemplate(params);
				
				// Add it to the page before the add button
				$this.parents('.nav').before(entryHtml);
				
				self.$el.dequeue();
			});
			
			self.$el.queue(function(){
				var $removePeople = $this.parent().find('.remove_person');
				$removePeople.off().on('click', function(e){
					var $target = $(this);
					var $entry = $target.parents('.schedule_edit_entry');
					$entry.remove();
				});
				
				self.$el.dequeue();
			});
		});
		
		self.$el.queue(function(){
			// Setup the date picker
			var $datePicker = $('#schedule_date_picker');
			$datePicker.datetimepicker({
				pickDate : true,
				pickTime : false,
				pick12HourFormat : false,
				pickSeconds : false,
				maskInput : false,			//text input mask
				startDate : -Infinity,		//min date
				endDate : Infinity			//max date
			});
			var picker = $datePicker.data('datetimepicker');
			var today = new Date(Date.now());
			picker.setDate(today);
			$datePicker.on('changeDate', function(e){
				console.log(e.date.toString());
			});
			$datePicker.find('input').on('click', function(e){
				$datePicker.find('.add-on').click();
			});
			
			self.$el.dequeue();
		});
		
		return self;
	}
	
	/**
	 * Extracts the changes on the form
	 */
	,extractFormData : function extractFormData(){
		var self = this;
		
		// Get the date
		var picker = $('#schedule_date_picker').data('datetimepicker');
		var date = app.util.Date.startOfDay(picker.getDate());
		
		// Get the complete entries
		var $entries = $('#schedule_edit_form .schedule_edit_entry');
		var entries = _.chain($entries)
			.map(function(entry){
				var $this = $(entry);
				var obj = {};
				obj.username = ($this.find('.user_selection').val() || "").trim();
				obj.name = ($this.find('.user_selection > :selected').text() || "").trim();
				obj.shift = ($this.find('.shift_selection').val() || "").trim();
				return obj;
			})
			.filter(function(entry){
				return !_.isEmpty(entry) && !_.isEmpty(entry.name) && !_.isEmpty(entry.username) && !_.isEmpty(entry.shift);
			})
			.value();
		
		// Build the data
		var data = {
			date : date,
			entries : entries
		};
		
		return data;
	}
	
	/**
	 * Generate the form to edit the schedule
	 */
	,generateEditForm : function generateEditForm(){
		var self = this;
		
		self.$el.queue(function(){
			var entryTemplate = app.util.TemplateCache.get("#schedule-edit-entry-template");
			var formTemplate = app.util.TemplateCache.get("#schedule-edit-form-template");
			
			//TODO: use data from mongo
			var people = [{
				username : "",
				name : "",
				shift : ""
			}];
			
			// Build the html for each entry
			var entries = _.map(people, function(person){
				return entryTemplate({
					entry : person,
					users : self.users
				});
			});
			
			// Build the form html and add it to the page
			var params = {
				entries : entries
			};
			var formHtml = formTemplate(params);
			$('#schedule_edit_form').html(formHtml);
			
			self.$el.dequeue();
		});
		
		return self;
	}
	
	/**
	 * Apply changes for the current day
	 */
	,applyChanges : function applyChanges(){
		var self = this;
		
		// Get the data from the form
		var data = self.extractFormData();
		
		// Build ajax options
		var options = {
			type : 'POST',
			url : "/api/schedule/update",
			cache : false,
			contentType : 'application/json',
			data : JSON.stringify(data)
		};
		
		// Make the ajax call
		return $.ajax(options);
	}
});
