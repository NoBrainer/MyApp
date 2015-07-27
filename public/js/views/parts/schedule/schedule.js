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
		this.calendarEvents = [];
		
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
		var thisMonth = app.util.Date.firstDayOfMonth(new Date());
		var nextMonth = app.util.Date.firstDayOfMonth(new Date());
		nextMonth.setMonth(nextMonth.getMonth()+1);
		var prevMonth = app.util.Date.firstDayOfMonth(new Date());
		prevMonth.setMonth(prevMonth.getMonth()-1);
		
		// Callback to render once ready
		var numCalls = 4;
		var renderIfReady = function renderIfReady(){
			numCalls--;
			if(numCalls === 0){
				self.render();
			}
		};
		
		// Make the ajax calls
		self.checkSchedule(prevMonth)
			.done(renderIfReady);
		self.checkSchedule(thisMonth)
			.done(renderIfReady);
		self.checkSchedule(nextMonth)
			.done(renderIfReady);
		self.getUserList()
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
		var prevData = _.findWhere(self.schedule, { dateString : self.prevDay.dateString });
		var nextData = _.findWhere(self.schedule, { dateString : self.nextDay.dateString });
		
		self.prevDay.entries = (_.isEmpty(prevData) ? [] : prevData.entries);
		self.nextDay.entries = (_.isEmpty(nextData) ? [] : nextData.entries);
		
		self.$el.queue(function(){
			// Add the html to the page
			var params = {
					scheduleList : self.shownDays,
					today : app.util.Date.startOfDay()
			};
			var template = app.util.TemplateCache.get("#schedule-template");
			var html = template(params);
			self.$el.html(html);
			
			self.$el.dequeue();
		});
		
		self.$el.queue(function(){
			// Initialize handlers
			self.initHandlers();

			self.$el.dequeue();
		});
		
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
		
		// Load the starting entry
		self.loadEntryToEdit();
		
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
		
		// Determine if the next day is today
		var today = app.util.Date.startOfDay();
		var isToday = (self.prevDay.dateString == today.toDateString());
		
		// Build the new html
		var templateParams = {
				item : self.prevDay,
				isToday : isToday
		};
		var newLabelHtml = labelTemplate(templateParams);
		var newContentHtml = contentTemplate(templateParams);
		
		// Scroll self.shownDays and self.nextDay
		self.nextDay = _.last(self.shownDays);
		self.shownDays = _.union([self.prevDay], _.initial(self.shownDays));
		
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
		
		// Determine if the next day is today
		var today = app.util.Date.startOfDay();
		var isToday = (self.nextDay.dateString == today.toDateString());
		
		// Build the new html
		var templateParams = {
				item : self.nextDay,
				isToday : isToday
		};
		var newLabelHtml = labelTemplate(templateParams);
		var newContentHtml = contentTemplate(templateParams);
		
		// Scroll self.shownDays and self.prevDay
		self.prevDay = _.first(self.shownDays);
		self.shownDays = _.union(_.tail(self.shownDays), [self.nextDay]);
		
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
	 * Load an entry for editing
	 */
	,loadEntryToEdit : function loadEntryToEdit(date){
		var self = this;
		
		// Clear the previous entries
		var $userSelectionList = $('.user_selection_list');
		$userSelectionList.empty();
		
		// Load the new entries
		$.when(self.checkSchedule(date))
			.done(function(resp){
				var entries = [];
				if(_.isEmpty(resp) || _.isEmpty(resp.entries)){
					// Show placeholder text for no entries
					$userSelectionList.text("TBD");
				}else{
					// Get the entries from the response
					entries = resp.entries;
					_.each(entries, function(entry){
						// Show the entries
						var userListTemplate = app.util.TemplateCache.get('#schedule-user-selection-list-template');
						var userListHtml = userListTemplate({ entries : entries });
						$userSelectionList.html(userListHtml);
					});
				}
			})
			.fail(function(resp){
				console.log(resp);
			});
		
		return self;
	}
	
	/**
	 * Setup the admin mode if the user is an admin
	 */
	,setupAdminMode : function setupAdminMode(){
		var self = this;
		if(!app.util.Login.isAdmin()){
			return self;
		}
		
		// Show admin controls
		self.$el.find('.admin_controls').show();
		
		// Generate the edit form
		self.generateEditForm();
		
		// Handler for toggling edit-mode
		$('#edit_schedule').on('click', function(e){
			self.$el.find('.admin_edit_toggle').toggle();

			var $editCalendar = $('#edit-calendar');
			if($editCalendar.html().trim() === ""){
				// Render the edit calendar if it hasn't been rendered
				self.renderEventsOnEditCalendar(self.schedule);
			}
		});
		
		// Handler for canceling edits
		$('#cancel_schedule').on('click', function(e){
			self.$el.find('.admin_edit_toggle').toggle();
		});
		
		// Handler for refreshing the page
		$('#refresh_schedule').on('click', function(e){
			self.syncAndRender();
			return false;
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
		$('#schedule_add_person').on('click', function(e, entry){
			var $this = $(this);
			
			// Get the entry from the parameter, default to an empty entry
			entry = entry || {
					username : "",
					name : "",
					shift : ""
			};
			
			self.$el.queue(function(){
				// Build the html
				var entryTemplate = app.util.TemplateCache.get("#schedule-edit-entry-template");
				var params = {
						entry : entry,
						users : self.users
				};
				var entryHtml = entryTemplate(params);
				
				// Add it to the page before the add button
				$this.parents('.nav').before(entryHtml);
				
				self.$el.dequeue();
			});
			
			self.$el.queue(function(){
				var $removePeople = $('#schedule_edit_form .remove_person');
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
				var date = app.util.Date.startOfDay(e.localDate);
				self.loadEntryToEdit(date);
			});
			var lastKeyUp = null;
			$datePicker.find('input')
				.on('click', function(e){
					$datePicker.find('.add-on').click();
				})
				.on('keyup', function(e){
					var $this = $(this);
					
					// Callback to try and update 1000ms after the last keyup
					var updateAfterSomeTime = function updateAfterSomeTime(){
						setTimeout(function(){
							if(Date.now() - lastKeyUp < 1000){
								// The last keyup was too recent, so check again later
								updateAfterSomeTime();
								return false;
							}
							// Enough time has passed since the last keyup, so check if we can update the date
							lastKeyUp = null;
							var text = $this.val();
							var match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
							if(match && match.length === 4){
								// The text is the correct date format, so trigger a date change
								var date = app.util.Date.startOfDay();
								var month = parseInt(match[1]);
								var day = parseInt(match[2]) + 1;
								var year = parseInt(match[3]);
								date.setMonth(month);
								date.setDate(day);
								date.setFullYear(year);
								$this.trigger('change', [text]);
								return false;
							}
						}, 1000);
					};
					if(_.isNull(lastKeyUp)){
						updateAfterSomeTime();
					}
					lastKeyUp = Date.now();
					return false;
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
		var date = app.util.Date.startOfDay(picker.getLocalDate());
		
		// Get the complete entries
		var $entries = $('#schedule_edit_form .schedule_edit_entry');
		var entries = _.chain($entries)
			.map(function(entry){
				var $this = $(entry);
				var obj = {};
				obj.username = ($this.find('.user_selection').val() || "").trim();
				obj.name = ($this.find('.user_selection > :selected').text() || "").trim();
				obj.shift = ($this.find('.shift_selection').val() || "open").trim();
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
				shift : "open"
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
			
			// Render the updates on the edit calendar
			self.renderEventsOnEditCalendar(newData);
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
		
		// Build the current date's string
		var currentDate = app.util.Date.startOfDay(date).toDateString();
		
		// Build the month string
		date = app.util.Date.firstDayOfMonth(date);
		var month = date.toDateString();
		
		// This is the empty schedule to be returned if there is no data for this date
		var emptySchedule = {
				date : moment(date).format('YYYY-MM-DD[T04:00:00.000Z]'),
				dateString : currentDate,
				entries : []
		};
		
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
						// Resolve with the schedule data for the given date
						var scheduleForDate = _.findWhere(self.schedule, { dateString : currentDate }) || emptySchedule;
						dfd.resolve(scheduleForDate);
					}
			};
			$.ajax(ajaxOpts);
		}else{
			// Resolve without a server call
			var scheduleForDate = _.findWhere(self.schedule, { dateString : currentDate }) || emptySchedule;
			dfd.resolve(scheduleForDate);
		}
		
		return dfd.promise();
	}
	
	/**
	 * 
	 */
	,initializeEditCalendar : function initializeEditCalendar(){
		var self = this;
		var $editCalendar = $('#edit-calendar');
		
		// Keeps track of the current schedule object that may be submitted to the server (when 'Apply Changes' is clicked)
		var updateObj = {
				date : null,
				dateString : null,
				entries : []
		};
		
		// Initialize the calendar
		var calendarOpts = {
				dayClick : function(date, jsEvent, view){
					
					// Update the date displayed in the modal
					var dateString = date.format('MMMM DD, YYYY')
					$dayModal.find('.schedule-edit-day-date').text(dateString)
					
					// Keep track of the data to post if we apply the changes
					updateObj.date = date.format('YYYY-MM-DD[T04:00:00.000Z]');
					updateObj.dateString = app.util.Date.startOfDay(updateObj.date).toDateString();
					updateObj.entries = [];
					
					// Check the schedule
					self.checkSchedule(updateObj.date)
						.done(function(schedule){
							console.log("finished checking schedule...");
							console.log(schedule);
							console.log(self.schedule);
							
							// Keep track of the entries from checking the schedule
							updateObj.entries = schedule.entries || [];
							
							// Populate the entries on the form
							updateEntryListUI(updateObj.entries);
							
							// Open the modal
							$dayModal.modal('show');
						});
				},
				eventClick : function(calEvent, jsEvent, view){
					// Clicking an event triggers clicking the day (they do the same thing)
					var date = calEvent.start;
					calendarOpts.dayClick(date, jsEvent, view);
					return false;
				},
				allDayDefault : true
		};
		$editCalendar.fullCalendar(calendarOpts);
		$editCalendar.fullCalendar('today');
		
		// Add the modal to the page
		var modalTemplate = app.util.TemplateCache.get("#schedule-edit-day-modal-template");
		var params = {
				users : self.users
		};
		var modalHtml = modalTemplate(params);
		$editCalendar.after(modalHtml);
		
		// Each time the month changes, render the events
		var $monthBtns = $editCalendar.find('.fc-prev-button,.fc-next-button,.fc-today-button');
		$monthBtns.on('click', function(){
			self.renderEventsOnEditCalendar(self.schedule);
		});
		
		// Schedule edit UI components
		var $dayModal = $('#schedule-edit-day-modal');
		var $scheduleList = $dayModal.find('.user_selection_list');
		var $userSelect = $dayModal.find('.user_selection');
		var $writeInBtn = $dayModal.find('.add_write_in_btn');
		var $writeInInput = $dayModal.find('.add_write_in_input');
		var $applyChangesBtn = $dayModal.find('.apply_schedule_edits');
		
		// Helper function to update the entries on the UI
		var updateEntryListUI = function(entries){
			// Update the html
			var template = app.util.TemplateCache.get('#schedule-user-selection-list-template');
			var html = template({ entries : entries });
			$scheduleList.html(html);
			
			// Add click handlers for the X buttons
			$scheduleList.find('.remove_user').off().on('click', function removeUser(e){
				// Remove the user from the updateObj entries
				var username = $(e.target).attr('data-username') || "";
				updateObj.entries = _.reject(updateObj.entries, function(entry){
					return entry.username === username;
				});
				
				updateEntryListUI(updateObj.entries);
			});
			
			// Hide the options that are selected
			var $options = $userSelect.find('option');
			$options.removeClass('hidden');
			_.each($options, function(option){
				var username = $(option).val() || "";
				var found = _.find(updateObj.entries, function(entry){
					return entry.username === username;
				});
				if(found){
					$(option).addClass('hidden');
				}
			});
			$userSelect.val("");
		};
		
		// Helper function to generate a temporary username that is unique to the schedule date
		var generateTempUsername = function(indexStr){
			var indexStr = indexStr || "";
			var base = "temp";
			var end = "@email.junk";
			var tempUsername = base+indexStr+end;
			var found = _.find(updateObj.entries, function(entry){
				return entry.username === tempUsername;
			});
			if(found){
				return generateTempUsername(_.uniqueId());
			}
			return tempUsername;
		};
		
		// Handler to add people via the dropdown
		$userSelect.on('change', function(e){
			// Get the selected username from the dropdown
			var selectedUsername = $userSelect.val() || "";
			if(selectedUsername === ""){
				return false;
			}
			
			// If it's not already in the list, then build the entry from self.users
			var foundUser = _.find(self.users, function(user){
				return user.username === selectedUsername;
			});
			if(!foundUser){
				console.log("Unexpected error! Username not found in self.users: "+selectedUsername);
				return false;
			}
			
			// Then update the entries
			var entryToAdd = {
					username : foundUser.username,
					name : foundUser.name,
					shift : "open" //TODO: remove this field
			};
			updateObj.entries.push(entryToAdd);
			
			// Then update the UI
			updateEntryListUI(updateObj.entries);
		});
		
		// Handler to add people via the write-in
		$writeInBtn.on('click', function(e){
			var writeInName = $writeInInput.val() || "";
			if(!_.isString(writeInName) || writeInName.trim() === ""){
				return false; //do nothing for a blank write-in
			}
			
			// Then update the entries
			var entryToAdd = {
					username : generateTempUsername(),
					name : writeInName,
					shift : "open"
			};
			updateObj.entries.push(entryToAdd);
			
			// Then update the UI
			updateEntryListUI(updateObj.entries);
			
			// Then clear the input
			$writeInInput.val("");
		});
		
		// Click the 'Add Write-in' button on ENTER keypress
		$writeInInput.on('keypress', function(e){
			if(e.keyCode === 13){
				$writeInBtn.click();
				return false;
			}
		});
		
		// Handler to apply the changes
		$applyChangesBtn.on('click', function(e){
			// Build ajax options
			var options = {
				type : 'POST',
				url : "/api/schedule/update",
				cache : false,
				contentType : 'application/json',
				data : JSON.stringify(updateObj)
			};
			
			// Update the local schedule
			self.updateLocalScheduleSingleDate(updateObj);
			
			// Make the ajax call to update the schedule server-side
			$.ajax(options)
				.done(function(resp){
					// Hide the modal on success
					$dayModal.modal('hide');
				})
				.fail(function(resp){
					console.log("fail");
					console.log(resp);
					alert("Unexpected error. Please try again");
				})
				.always(function(){
					//TODO: figure out a non-hacky way to refresh the calendar
					$('.fc-next-button').click();
					$('.fc-prev-button').click();
				});
		});
	}
	
	/**
	 * Update a single date on the local schedule then refresh the calendar
	 */
	,updateLocalScheduleSingleDate : function updateLocalScheduleSingleDate(updatedDateObj){
		var self = this;
		
		// Validate input
		//TODO
		
		// Update local schedule
		self.schedule = _.reject(self.schedule, function(item){
			return item.date === updatedDateObj.date;
		});
		self.schedule.push(updatedDateObj);
		self.schedule = _.sortBy(self.schedule, function(item){
			return new Date(item.date).getTime();
		});
		
		// Refresh the calendar
		//TODO: see if we need this
		self.forceRefreshEditCalendar(updatedDateObj.date);
		
		return self;
	}
	
	/**
	 * TODO: remove if this alternative try doesn't work... it seems too hacky
	 */
	,forceRefreshEditCalendar : function forceRefreshEditCalendar(atDate){
		var self = this;
//		var $editCalendar = $('#edit-calendar');
		
		$('#edit-calendar').parent().html("<div id='edit-calendar'></div>");
		self.initializeEditCalendar();
		
		if(!_.isString(atDate) || _.isEmpty(atDate)){
			$('#edit-calendar').fullCalendar('today');
		}else{
			$('#edit-calendar').fullCalendar('gotoDate', moment(atDate));
		}
		
		return self;
	}
	
	/**
	 * 
	 */
	,renderEventsOnEditCalendar : function renderEventsOnEditCalendar(eventList){
		var self = this;
		var $editCalendar = $('#edit-calendar');
		
		// Initialize the calendar if necessary
		if(_.isEmpty($editCalendar) || _.isEmpty($editCalendar.html()) || _.isEmpty($editCalendar.html().trim())){
			self.initializeEditCalendar();
		}
		
		// Map each item in the event list to a fullcalendar event object
		var newCalendarEvents = _.reduce(eventList, function(memo, item){
			var start = item.date.substring(0, item.date.indexOf('T'));
			_.each(item.entries, function(entry){
				memo.push({
					title : entry.name
					,start : start
				});
			});
			return memo;
		}, []);
		
		// Update the edit calendar
		_.each(newCalendarEvents, function(newEvent){
			$editCalendar.fullCalendar('renderEvent', newEvent);
		});
	}
});

var ONE_DAY = 1000 * 60 * 60 * 24;
var SEVEN_DAYS = ONE_DAY * 7;
