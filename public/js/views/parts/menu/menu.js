app.view.part.Menu = Backbone.View.extend({
	
	el : ""
	
	/**
	 * Constructor
	 * @memberOf app.view.part.Menu
	 */
	,initialize : function initialize(){
		this.menuMapping = {
				"food": "/resources/menus/food-menu.png",
				"01": "/resources/menus/drink-menu-01-guide.png",
				"02": "/resources/menus/drink-menu-02-smash.jpg",
				"03": "/resources/menus/drink-menu-03-daiquiri.png",
				"04": "/resources/menus/drink-menu-04-horse.png",
				"05": "/resources/menus/drink-menu-05-ny.png",
				"06": "/resources/menus/drink-menu-06-champagne.png",
				"07": "/resources/menus/drink-menu-07-old-fashioned.png",
				"08": "/resources/menus/drink-menu-08-south-of-the-border.png",
				"09": "/resources/menus/drink-menu-09-bitters.png",
				"10": "/resources/menus/drink-menu-10-tiki.png",
				"11": "/resources/menus/drink-menu-11-gin-martini.png",
				"12": "/resources/menus/drink-menu-12-equal-parts.png",
				"13": "/resources/menus/drink-menu-13-ginger.png",
				"14": "/resources/menus/drink-menu-14-mirror.png",
				"15": "/resources/menus/drink-menu-15-savory.png",
				"16": "/resources/menus/drink-menu-16-greatest-hits.png",
				"17": "/resources/menus/drink-menu-17-tall-potations.png",
				"18": "/resources/menus/drink-menu-18-negroni.png",
				"19": "/resources/menus/drink-menu-19-founding-farmers.png",
				"20": "/resources/menus/drink-menu-20-list.png",
				"21": "/resources/menus/drink-menu-21-dude.png",
				"22": "/resources/menus/drink-menu-22-double-feature.png",
				"23": "/resources/menus/drink-menu-23-daiquiri-part-2.png",
				"24": "/resources/menus/drink-menu-24-sasha.png",
				"25": "/resources/menus/drink-menu-25-hemingway.png",
				"26": "/resources/menus/drink-menu-26-q&a.png",
				"27": "/resources/menus/drink-menu-27-something-different.png",
				"28": "/resources/menus/drink-menu-28-movies.png",
				"29": "/resources/menus/drink-menu-29-grapefruit.png",
				"30": "/resources/menus/drink-menu-30-5050.png",
				"31": "/resources/menus/drink-menu-31-price.png",
				"32": "/resources/menus/drink-menu-32-manhattan-2.png",
				"33": "/resources/menus/drink-menu-33-new-year.png",
				"34": "/resources/menus/drink-menu-34-tiki-a.png",
				"35": "/resources/menus/drink-menu-35-tiki-b.png",
				"36": "/resources/menus/drink-menu-36-like-it-a.png",
				"37": "/resources/menus/drink-menu-37-like-it-b.png"
		};
		this.nextMenuIndex = 0;
	}
	
	/**
	 * Render
	 */
	,render : function render(){
		var self = this;
		
		// Add the html to the page
		var params = {}
		var template = app.util.TemplateCache.get("#menu-template");
		var html = template(params);
		self.$el.html(html);
		
		// Initialize handlers
		self.initHandlers();
		
		return self;
	}
	
	/**
	 * Initialize handlers
	 */
	,initHandlers : function initHandlers(){
		var self = this;
		
		// Setup the admin mode if the user is an admin
		self.setupAdminMode();
		
		// Click handler for edit button
		$('#edit_menu').on('click', function(e){
			alert("This function has not yet been implemented. Contact Vincent to update the menu: vincent.incarvite@gmail.com");
		});
		
		// On scroll, update which menus are loaded
		$(window).on('scroll.menus', _.throttle(_.bind(this.loadMenus, this), 500));
		
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
		
		return self;
	}
	
	,loadMenus : function(){
		var $menuDivs = this.$('.menu_img'),
			numMenuDivs = $menuDivs.length,
			$window = $(window);
		if(this.nextMenuIndex >= numMenuDivs){
			// Short-circuit and turn off the handler
			$window.off('scroll.menus');
			return;
		}
		
		// Check the div top and window bottom (taking scrolling into account)
		var $nextDiv = $($menuDivs.get(this.nextMenuIndex)),
			nextTop = $nextDiv.offset().top,
			scrollBottom = $window.scrollTop() + $window.height(),
			threshold = 700;
		if(scrollBottom + threshold > nextTop){
			// Generate the URL from the div id and menu mapping
			var id = $nextDiv.attr('id'),
				url = this.menuMapping[id];
			if(url){
				// Apply the URL as the background-image
				$nextDiv.css('background-image', "url(X)".replace('X', url));
			}
			
			// Check the next menu
			this.nextMenuIndex++;
			this.loadMenus();
		}
	}
});
