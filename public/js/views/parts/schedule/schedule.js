app.view.part.Schedule = Backbone.View.extend({
	
	el : ""
	
	/**
	 * Constructor
	 */
	,initialize : function(){
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
	}
	
	/**
	 * Render
	 */
	,render : function(){
		var self = this;
		
		//TODO: sync
		
		// Add the html to the page
		var params = self.data || self.stubData;
		var template = app.util.TemplateCache.get("#schedule-template");
		var html = template(params);
		self.$el.html(html);
		
		// Initialize handlers
		self.initHandlers();
		
		return self;
	}
	
	/**
	 * Initialize handlers
	 */
	,initHandlers : function(){
		var self = this;
		
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
});
