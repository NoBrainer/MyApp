app.view.part.News = Backbone.View.extend({
	
	el : ""
	
	/**
	 * Constructor
	 * @memberOf app.view.part.News
	 */
	,initialize : function initialize(){
		this.stubData = [
			{
				postedDate : new Date(1410045634906),
				title :		"Soft Opening",
				content :	"Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin " +
							"commodo. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum " +
							"nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus."
			},
			{
				postedDate : new Date(1410045134906),
				title :		"Grand Opening",
				content :	"Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin " +
							"commodo. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum " +
							"nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus."
			}
		];
	}
	
	/**
	 * Get the data then render
	 */
	,syncAndRender : function syncAndRender(){
		var self = this;
		
		// Build ajax options
		var options = {
			type : 'GET',
			url : "/api/news",
			cache : false,
			contentType : 'application/json'
		};
		options.success = function(resp){
			if(_.isNull(resp.error)){
				self.news = _.isEmpty(resp.news) ? [self.stubData] : resp.news;
				self.render(self.news);
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
	 * Render
	 */
	,render : function render(news){
		var self = this;
		
		// Filter to only show un-archived news entries
		news = _.filter(news, function(entry){
			return (entry.isArchived === false);
		});
		
		// Add the html to the page
		var params = {
			news : news
		}
		var template = app.util.TemplateCache.get("#news-template");
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
		
		// Add toggle functionality to the truncated text
		$('.news_toggle').on('click', function(e){
			$(this).parent().find('.news_toggle').toggle();
		});
		
		// Setup the admin mode if the user is an admin
		self.setupAdminMode();
		
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
		
		// Show the admin controls
		self.$el.find('.admin_controls').show();
		
		// Generate the edit form
		self.generateEditForm();
		
		// Handler for toggling edit-mode
		$('#edit_news').on('click', function(e){
			self.$el.find('.admin_edit_toggle').toggle();
		});
		
		// Handler for canceling edits
		$('#cancel_news').on('click', function(e){
			self.$el.find('.admin_edit_toggle').toggle();
		});
		
		// Handler for saving edits
		$('#save_news').on('click', function(e){
			$.when(self.saveChanges())
				.done(function(resp){
					app.router.reloadPage();
				})
				.fail(function(resp){
					console.log("Failed to save changes");
					console.log(resp);
					alert("Failed to save changes. Please try again.");
				});
		});
		
		// Handler for adding news entries
		$('#news_add_more').on('click', function(e){
			var $this = $(this);
			
			// Build the html
			var entryTemplate = app.util.TemplateCache.get("#news-edit-entry-template");
			var item = {
					id : "new",
					title : "",
					content : "",
					isArchived : false
			};
			var entryHtml = entryTemplate(item);
			
			// Add it to the page before the add button
			$this.before(entryHtml);
		});
		
		return self;
	}
	
	/**
	 * Gets the last news data we got from the server (with some fields filtered for _.isEqual comparison)
	 */
	,lastLoadedNews : function lastLoadedNews(){
		var self = this;
		
		var data = _.map(self.news, function(entry){
			return {
				id : entry.id,
				title : entry.title,
				content : entry.content,
				isArchived : entry.isArchived,
				deleted : false
			};
		}, []);
		
		return data;
	}
	
	/**
	 * Extracts the changes on the edit form
	 */
	,extractNewsEdits : function extractNewsEdits(){
		var self = this;
		
		var $entries = $('#news_edit_form .news_edit_entry');
		var data = _.map($entries, function(entry){
			var $this = $(entry);
			var obj = {};
			obj.id= $this.attr('db-id') || "";
			obj.title = ($this.find('.news_edit_title').val() || "").trim();
			obj.content = ($this.find('.news_edit_content').val() || "").trim();
			obj.isArchived = ($this.find('.news_edit_archived').is(':checked') || false);
			obj.deleted = ($this.find('.news_edit_delete').is(':checked') || false);
			return obj;
		});
		
		return data;
	}
	
	/**
	 * Generate the form to edit news entries
	 */
	,generateEditForm : function generateEditForm(){
		var self = this;
		
		var entryTemplate = app.util.TemplateCache.get("#news-edit-entry-template");
		var formTemplate = app.util.TemplateCache.get("#news-edit-form-template");
		
		// Build the html for each entry
		var entries = _.map(self.news, function(item){
			item.id = item.id;
			return entryTemplate(item);
		});
		
		// Build the form html and add it to the page
		var params = {
			entries : entries
		};
		var formHtml = formTemplate(params);
		$('#news_edit_form').html(formHtml);
		
		return self;
	}
	
	/**
	 * Save the changes made to the edit form
	 */
	,saveChanges : function saveChanges(){
		var self = this;
		
		// Get the entries from the edit form
		var entries = self.extractNewsEdits();
		
		// Determine which entries have been marked for deletion
		var deletionIds = _.reduce(entries, function(memo, entry){
			if(entry.deleted && entry.id !== "new"){
				memo.push(entry.id);
			}
			return memo;
		}, []);
		
		// Determine which entries are new
		var newEntries = _.reduce(entries, function(memo, entry){
			if(entry.id === "new" && !entry.deleted){
				memo.push(entry);
			}
			return memo;
		}, []);
		
		// Determine which entries have been modified
		var prevEntries = self.lastLoadedNews();
		var modifiedEntries = _.reduce(entries, function(memo, entry){
			var id = entry.id;
			var isNotDeletedOrNew = !(entry.deleted || entry.id === "new");
			var prevEntry = _.findWhere(prevEntries, { id : id });
			if(isNotDeletedOrNew && !_.isEmpty(prevEntry) && !_.isEqual(prevEntry, entry) && prevEntry.id === entry.id){
				memo.push(entry);
			}
			return memo;
		}, []);
		
		// Send the changes to the server
		var dfd = $.Deferred();
		var numCalls = 3;
		var checkForCompletion = function(resp){
			numCalls--;
			if(numCalls === 0){
				dfd.resolve();
			}
		};
		var rejectOnFailure = function(resp){
			console.log(resp);
			dfd.reject();
		};
		$.when(self.deleteEntries(deletionIds))
				.done(checkForCompletion)
				.fail(rejectOnFailure);
		$.when(self.createNewEntries(newEntries))
				.done(checkForCompletion)
				.fail(rejectOnFailure);
		$.when(self.updateEntries(modifiedEntries))
				.done(checkForCompletion)
				.fail(rejectOnFailure);
		
		return dfd.promise();
	}
	
	/**
	 * Delete each entry provided in the array of ids
	 */
	,deleteEntries : function deleteEntries(ids){
		var self = this;
		
		// Build ajax options
		var deleteOpts = {
			type : 'POST',
			url : "/api/news/remove",
			cache : false,
			contentType : 'application/json',
			data : JSON.stringify({
				ids : ids
			})
		};
		
		if(!_.isEmpty(ids) && _.isArray(ids)){
			// Delete each entry with the given id
			return $.ajax(deleteOpts);
		}else{
			// Return a blank ajax call that will always succeed
			return $.ajax();
		}
	}
	
	/**
	 * Create a new entry for each entry in the provided array
	 */
	,createNewEntries : function createNewEntries(entries){
		var self = this;
		var dfd = $.Deferred();
		
		// Build ajax options
		var createOpts = {
			type : 'POST',
			url : "/api/news/create",
			cache : false,
			contentType : 'application/json',
			success : function(resp){
				numEntries--;
				if(numEntries === 0){
					dfd.resolve();
				}
			},
			error : function(resp){
				console.log("Failed to create new entries");
				console.log(resp);
				dfd.reject();
			}
		};
		
		if(!_.isEmpty(entries) && _.isArray(entries)){
			// Make a create call to the server for each entry
			var numEntries = entries.length;
			_.each(entries, function(entry){
				var opts = createOpts;
				opts.data = JSON.stringify(entry);
				$.ajax(opts);
			});
		}else{
			// Successfully resolve if there's nothing to do
			dfd.resolve();
		}
		
		return dfd.promise();
	}
	
	/**
	 * Update entries from the provided array of entries (only if they've changed)
	 */
	,updateEntries : function updateEntries(entries){
		var self = this;
		var dfd = $.Deferred();
		
		// Build ajax options
		var updateOpts = {
			type : 'POST',
			url : "/api/news/update",
			cache : false,
			contentType : 'application/json',
			success : function(resp){
				numEntries--;
				if(numEntries === 0){
					dfd.resolve();
				}
			},
			error : function(resp){
				console.log("Failed to update entries");
				console.log(resp);
				dfd.reject();
			}
		};
		
		if(!_.isEmpty(entries) && _.isArray(entries)){
			// Make a create call to the server for each entry
			var numEntries = entries.length;
			_.each(entries, function(entry){
				var opts = updateOpts;
				opts.data = JSON.stringify(entry);
				$.ajax(opts);
			});
		}else{
			// Successfully resolve if there's nothing to do
			dfd.resolve();
		}
		
		return dfd.promise();
	}
});
