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
		var numCalls = 3;
		var renderIfReady = function renderIfReady(){
			numCalls--;
			if(numCalls === 0){
				self.render();
			}
		};
		
		// Make the ajax calls
		self.getUserList()
			.done(renderIfReady);
		self.checkSchedule(thisMonth)
			.done(renderIfReady);
		self.checkSchedule(nextMonth)
			.done(renderIfReady);
		
		return self;
	}
	
	/**
	 * Render
	 */
	,render : function render(){
		var self = this;
		
		// Build the template of days
		var earliest = app.util.Date.startOfDay().getTime();
		var latest = earliest + SEVEN_DAYS;
		var weekList = _.range(earliest, latest, ONE_DAY);
		weekList = _.map(weekList, function(item){
			var date = new Date(item);
			return {
					date : date,
					dateString : date.toDateString(),
					entries : [],
					label : app.util.Date.toStringShort(date)
			};
		});
		
		// Add the schedule data to the template of days
		self.shownDays = _.map(weekList, function(item){
			var data = _.findWhere(self.schedule, { dateString : item.dateString });
			item.entries = (_.isEmpty(data) ? [] : data.entries);
			return item;
		});
		
		// Build the template for the prev and next day
		var prevDay = new Date(earliest - ONE_DAY);
		var nextDay = new Date(latest);
		self.prevDay = {
				date : prevDay,
				dateString : prevDay.toDateString(),
				entries : [],
				label : app.util.Date.toStringShort(prevDay)
		};
		self.nextDay = {
				date : nextDay,
				dateString : nextDay.toDateString(),
				entries : [],
				label : app.util.Date.toStringShort(nextDay)
		};
		
		// Add the schedule data to the template for the prev/next days
		var prevData = _.findWhere(self.schedule, { dateString : prevDay.dateString });
		var nextData = _.findWhere(self.schedule, { dateString : nextDay.dateString });
		self.prevDay.entries = (_.isEmpty(prevData) ? [] : prevData.entries);
		self.nextDay.entries = (_.isEmpty(nextData) ? [] : nextData.entries);
		
		// Add the html to the page
		var params = {
				scheduleList : self.shownDays
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
		
		// Click handlers for the prev/next buttons
		$('#schedule_content .schedule_scroll_left').on('click', _.bind(self.scrollLeft, self));
		$('#schedule_content .schedule_scroll_right').on('click', _.bind(self.scrollRight, self));
		
		return self;
	}
	
	/**
	 * Scroll the schedule left
	 */
	,scrollLeft : function scrollLeft(){
		var self = this;
		
		var indexToRemove = 6;
		var $labelCells = $('#schedule_content .schedule_label_cell');
		var $contentCells = $('#schedule_content .schedule_content_cell');
		var $leftArrowLabel = $('#schedule_content .arrow_cell_left');
		var $leftArrowContent = $('#schedule_content .blank_cell_left');
		var labelTemplate = app.util.TemplateCache.get("#schedule-label-template");
		var contentTemplate = app.util.TemplateCache.get("#schedule-item-template");
		
		// Build the new html
		var templateParams = {
				item : self.prevDay
		};
		var newLabelHtml = labelTemplate(templateParams);
		var newContentHtml = contentTemplate(templateParams);
		
		// Scroll self.shownDays and self.nextDay
		self.nextDay = _.last(self.shownDays);
		self.shownDays = _.union(self.prevDay, _.initial(self.shownDays));
		
		// Update the UI
		$labelCells.get(indexToRemove).remove();
		$contentCells.get(indexToRemove).remove();
		$leftArrowLabel.after(newLabelHtml);
		$leftArrowContent.after(newContentHtml);
		
		// Calculate a new prevDay
		var newPrevDay = new Date(self.prevDay.date.getTime() - ONE_DAY);
		self.prevDay = {
				date : newPrevDay,
				dateString : newPrevDay.toDateString(),
				entries : [],
				label : app.util.Date.toStringShort(newPrevDay)
		};
		var prevData = _.findWhere(self.schedule, { dateString : self.prevDay.dateString });
		self.prevDay.entries = (_.isEmpty(prevData) ? [] : prevData.entries);
		
		// Check 7 days back to pre-load more schedule data
		var sevenDaysPrior = new Date(newPrevDay.getTime() - (ONE_DAY*7));
		self.checkSchedule(sevenDaysPrior);
		
		return false;
	}
	
	/**
	 * Scroll the schedule right
	 */
	,scrollRight : function scrollRight(){
		var self = this;
		
		var indexToRemove = 0;
		var $labelCells = $('#schedule_content .schedule_label_cell');
		var $contentCells = $('#schedule_content .schedule_content_cell');
		var $rightArrowLabel = $('#schedule_content .arrow_cell_right');
		var $rightArrowContent = $('#schedule_content .blank_cell_right');
		var labelTemplate = app.util.TemplateCache.get("#schedule-label-template");
		var contentTemplate = app.util.TemplateCache.get("#schedule-item-template");
		
		// Build the new html
		var templateParams = {
				item : self.nextDay
		};
		var newLabelHtml = labelTemplate(templateParams);
		var newContentHtml = contentTemplate(templateParams);
		
		// Scroll self.shownDays and self.prevDay
		self.prevDay = _.first(self.shownDays);
		self.shownDays = _.union(_.tail(self.shownDays), self.nextDay);
		
		// Update the UI
		$labelCells.get(indexToRemove).remove();
		$contentCells.get(indexToRemove).remove();
		$rightArrowLabel.before(newLabelHtml);
		$rightArrowContent.before(newContentHtml);
		
		// Calculate a new nextDay
		var newNextDay = new Date(self.nextDay.date.getTime() + ONE_DAY);
		self.nextDay = {
				date : newNextDay,
				dateString : newNextDay.toDateString(),
				entries : [],
				label : app.util.Date.toStringShort(newNextDay)
		};
		var nextData = _.findWhere(self.schedule, { dateString : self.nextDay.dateString });
		self.nextDay.entries = (_.isEmpty(nextData) ? [] : nextData.entries);
		
		// Check 7 days forward to pre-load more schedule data
		var sevenDaysForward = new Date(newNextDay.getTime() + (ONE_DAY*7));
		self.checkSchedule(sevenDaysForward);
		
		return false;
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
		
		if(!_.isEmpty(month) && !self.alreadyLoadedMonth(month)){
			// Keep track of what months we've loaded
			self.months.push(month);
		}
		
		if(!_.isEmpty(newData)){
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
					complete : function(){
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

var ONE_DAY = 1000 * 60 * 60 * 24;
var SEVEN_DAYS = ONE_DAY * 7;
