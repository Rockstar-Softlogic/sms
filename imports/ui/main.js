var inbox = "article.inbox.dropdown-notice",
		notice = "article.notification.dropdown-notice",
		user = "li.nav-item.dropdown-user>ul";

Template.dashboard.onRendered(function(){
	$("#sidebar").perfectScrollbar({suppressScrollX:true});
	$(window).resize(function(){
		$("#sidebar").removeClass("default-sidebar no-sidebar icon-sidebar");
		$("#sidebar li.menu-item").children("a").children("span.fa").removeClass("fa-chevron-down").addClass("fa-chevron-right");
		$(".menu-item>ul.submenu").slideUp("slow");
		$("#main-content").attr("class","");
	});
});
Template.dashboard.events({
	"click #sidebar li.menu-item":function(e){
		let self = e.currentTarget;
		var width = window.innerWidth;
		e.stopPropagation();
		if(width>768 && !$("#sidebar").hasClass("icon-sidebar")){
			var currentListItem = $(self).children("a").children("span.fa");
	        var li = $("#sidebar li.menu-item").not($(self)).children("a").children("span.fa");//all list item but not the currently clicked one
	        var menu = $("#sidebar li.menu-item>ul.submenu").not($(self));
	            li.removeClass("fa-chevron-down").addClass("fa-chevron-right");
	            menu.slideUp("fast");
	            //check the currently click element fa-chevron-right or down
	            if(currentListItem.hasClass("fa-chevron-right")){
	                currentListItem.removeClass("fa-chevron-right").addClass("fa-chevron-down");
	                $(self).children(".menu-item>ul.submenu").slideDown("fast");
	            }else{
	                currentListItem.removeClass("fa-chevron-down").addClass("fa-chevron-right");
	                $(self).children(".menu-item>ul.submenu").slideUp("fast");
	            }
		 }else{
		 	var child = $(self).children("ul.submenu").html();
		 		$(".mobile-menu ul").html(child);
		 }
	},
	"click #main-content":function(){
		var width = window.innerWidth;
		$("#sidebar li.menu-item").children("a").children("span.fa").removeClass("fa-chevron-down").addClass("fa-chevron-right");
		$(".menu-item>ul.submenu").slideUp("slow");
		if(width<475 && $("#sidebar").hasClass("default-sidebar")){
			$("#sidebar").removeClass("default-sidebar");
		}
	},
	"click #sidebar .menu-item>ul.submenu":function(){
		return false;
	},
	"click .nav-toggler":function(e){
		var width = window.innerWidth;
		if(width<475){
			$("#sidebar").toggleClass("default-sidebar");
		}else if(width>=475 && width<=768){
			$("#sidebar").toggleClass("no-sidebar");
			$("#main-content").toggleClass("full-width-content");
		}else{
			$("#sidebar").toggleClass("icon-sidebar");
			$("#main-content").toggleClass("md-width-content");
		}
	},
	"click #main-content,#sidebar,#top-nav":function(){
		$(`${notice},${inbox},${user}`).slideUp();
	},
	"click li.nav-item.dropdown-notification":function(e){
		e.stopPropagation();
		$(`${inbox},${user}`).slideUp();
		$(`${notice}`).slideToggle();
	},
	"click li.nav-item.dropdown-inbox":function(e){
		e.stopPropagation();
		$(`${notice},${user}`).slideUp();
		$(`${inbox}`).slideToggle();
	},
	"click li.nav-item.dropdown-user":function(e){
		e.stopPropagation();
		$(`${notice},${inbox}`).slideUp();
		$(`${user}`).slideToggle();
	}
});

Template.dashboard.onDestroyed(function(){
	$(window).off("resize");
});