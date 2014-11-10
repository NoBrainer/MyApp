app.view.part.Schedule = Backbone.View.extend({
	
	el : ""
	
	/**
	 * Constructor
	 * @memberOf app.view.part.Schedule
	 */
	,initialize : function initialize(){
		// Array of schedule entries
		this.schedule = [];
		
		// Array of months we've loaded
		this.months = [];
		
		// Keep track of when we get the data
		this.dataAge = null;
		
		// Stub data used if no users are returned
		this.stubUser = {
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
		
		// Create a date for each month of schedule data
		var thisMonth = new Date();
		var nextMonth = new Date();
		nextMonth.setMonth(nextMonth.getMonth()+1);
		
		// Callback to render once ready
		var numCalls = 2;//TODO: change this to 3 when ready
		var renderIfReady = function renderIfReady(){
			numCalls--;
			if(numCalls === 0){
				self.render();
			}
		};
		
		// Make the ajax calls
		self.getUserList()
			.done(renderIfReady);
		//TODO: uncomment this and remove self.getScheduleEntries() when ready
//		self.checkSchedule(thisMonth)
//			.done(renderIfReady);
//		self.checkSchedule(nextMonth)
//			.done(renderIfReady);
		self.getScheduleEntries()
			.done(renderIfReady);
		
		return self;
	}
	
	/**
	 * Render
	 */
	,render : function render(){
		var self = this;
		
		//TODO: Pull data out of self.schedule to show
		//TODO: Make it so we can scroll through self.schedule's data
		
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
	
	/**
	 * Get the list of users and update self.users
	 */
	,getUserList : function getUserList(){
		var self = this;
		
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
			}else{
				self.renderError(resp.error);
			}
		};
		userOpts.error = function(resp){
			self.renderError("Failure to communicate with site. Try again later. [app.view.part.Schedule.getUserList]");
		};
		
		// Make the ajax calls
		return $.ajax(userOpts);
	}
	
	/**
	 * Get schedule entries and merge them with self.schedule
	 */
	,getScheduleEntries : function getScheduleEntries(date){
		var self = this;
		
		date = date || new Date();
		date = app.util.Date.firstDayOfMonth(date);
		
		// Build ajax options for getting the schedule list
		var scheduleOpts = {
			type : 'GET',
			url : "/api/schedule/month",
			cache : false,
			contentType : 'application/json',
			data : {
					date : date
			}
		};
		scheduleOpts.success = function(resp){
			if(_.isNull(resp.error)){
				self.updateLocalScheduleData(resp.schedule, resp.month);
			}else{
				console.log(resp.message);
				self.renderError(resp.error);
			}
		};
		scheduleOpts.error = function(resp){
			console.log(resp.message);
			self.renderError("Failure to communicate with site. Try again later. [app.view.part.Schedule.getScheduleEntries]");
		};
		
		// Make the ajax call
		return $.ajax(scheduleOpts);
	}
	
	/**
	 * Update the local schedule data.
	 * @param newData - {Array} response from the server
	 * @param month - {String} returned from {Date.toDateString()}
	 */
	,updateLocalScheduleData : function updateLocalScheduleData(newData, month){
		var self = this;
		
		newData = newData || [];
		month = month || "";
		
		if(_.isEmpty(self.dataAge)){
			// Keep track of the first time we retrieve data
			self.dataAge = Date.now();
		}
		
		if(!_.isEmpty(month) && !_.isEmpty(newData) && !self.alreadyLoadedMonth(month)){
			// Keep track of what months we've loaded
			self.months.push(resp.month);
			
			// Update the schedule
			self.schedule = _.union(self.schedule, newData);
		}
		
		return self;
	}
	
	/**
	 * Check if we've already loaded this month.
	 * @param month - {String} returned from {Date.toDateString()}
	 */
	,alreadyLoadedMonth : function alreadyLoadedMonth(month){
		var self = this;
		
//		//TODO: uncomment when we get things working
//		// Check if the local schedule data is stale
//		var tenMinAgo = Date.now() - (1000 * 60 * 10);
//		if(self.dataAge < tenMinAgo){
//			// Reset the local schedule data
//			self.schedule = [];
//			self.months = [];
//			self.dataAge = null;
//			return false;
//		}
		
		// Say we've already loaded it if the month is invalid
		if(_.isEmpty(month) || !_.isString(month)){
			return true;
		}
		
		return _.contains(self.months, month);
	}
	
	/**
	 * Check the schedule for a given date's month. Get more schedule data from the server if necessary.
	 * @param date - {Date}
	 */
	,checkSchedule : function checkSchedule(date){
		var self = this;
		var dfd = $.Deferred();
		
		// Build the month string
		date = app.util.Date.firstDayOfMonth(date);
		var month = date.toDateString();
		
		// Check if we've already loaded this month
		if(!self.alreadyLoadedMonth(month)){
			// Make a server call
			var ajaxOpts = {
					type : 'GET',
					url : '/api/schedule/month',
					cache : false,
					contentType : 'application/json',
					data : {
						date : date
					},
					success : function(resp){
						if(_.isNull(resp.error)){
							self.updateLocalScheduleData(resp.schedule, resp.month);
						}else{
							console.log(resp.message);
							console.log(resp);
						}
					},
					error : function(resp){
						console.log("Failed to get schedule data");
						console.log(resp);
					},
					always : function(){
						dfd.resolve();
					}
			};
			$.ajax(ajaxOpts);
		}else{
			// Resolve without a server call
			dfd.resolve();
		}
		
		return dfd.promise();
	}
});
