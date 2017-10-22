import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { FlowRouter } from 'meteor/kadira:flow-router';
import "./auth.html";
//ui
import "./ui/bootstrap.min.js";
import "./ui/perfect-scrollbar.jquery.js";
import "./ui/main.js";
//logic
import "./startup/route.js";
import "./startup/globalHelpers.js";
import "./student/client/main.js";
import "./admin/client/main.js";

var inbox = "article.inbox.dropdown-notice",
		notice = "article.notification.dropdown-notice",
		user = "li.nav-item.dropdown-user>ul";
function toggleTablePadding(){
	let width = window.innerWidth;
	window.onload = function(){
		alert("hi");
		if(width<=475){
			$("table").addClass("table-sm");
		}else{
			$("table").removeClass("table-sm");
		}
	}
	window.onresize = function(){
		if(width<=475){
			$("table").addClass("table-sm");
		}else{
			$("table").removeClass("table-sm");
		}
	}
}
Template.dashboard.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("setting");
			self.subscribe('editor.list');
			self.subscribe('staff.list');
			self.subscribe("staff.name");
			self.subscribe("staff.info");
			self.subscribe("student.list");
			self.subscribe('graduate.list');
			self.subscribe("result.list");
			self.subscribe("payment.list");
			self.subscribe("subject.list");
			self.subscribe('message.list');
			self.subscribe("assignment.list");
			self.subscribe("log.list");
		});
});

Template.dashboard.onRendered(function(){
	$("#sidebar").perfectScrollbar({suppressScrollX:true});
	$(".dropdown-user>ul").perfectScrollbar({suppressScrollX:true});
	$("article.dropdown-notice").perfectScrollbar({suppressScrollX:true});
	$(window).resize(function(){
		$("#sidebar").removeClass("default-sidebar no-sidebar icon-sidebar");
		$("#sidebar li.menu-item").children("a").children("span.fa").removeClass("fa-chevron-down").addClass("fa-chevron-right");
		$(".menu-item>ul.submenu").slideUp("slow");
		$("#main-content").attr("class","");
	});
});
Template.dashboard.events({
	"click #sidebar>ul>li":function(e){
		let self = $(e.currentTarget);
		var width = window.innerWidth;
		if(width>768 && !$("#sidebar").hasClass("icon-sidebar")){
			var current = self.children("a").children("span.fa");
	        var li = $("#sidebar li.menu-item").not(self).children("a").children("span.fa");//all list item but not the currently clicked one
	        var menu = $("#sidebar li.menu-item").not(self).children("ul.submenu");
	            li.removeClass("fa-chevron-down").addClass("fa-chevron-right");
	            menu.slideUp("fast");
	            //slideDown this&add chevron down
	           // if(current.hasClass("fa-chevron-down")){//is opened?
	           // 		current.removeClass("fa-chevron-down").addClass("fa-chevron-right");
		          //   	self.children("ul.submenu").slideUp();
		          //   	return;
	           // }
	           current.removeClass("fa-chevron-right").addClass("fa-chevron-down");
		       self.children("ul.submenu").slideDown();
		 }else{
		 	var child = self.children("ul.submenu").html();
		 		$(".mobile-menu ul").html(child);
		 }
	},
	"click #main-content":function(){
		var width = window.innerWidth;
		$("#sidebar>ul>li.menu-item").children("a").children("span.fa").removeClass("fa-chevron-down").addClass("fa-chevron-right");
		$("#sidebar>ul>li.menu-item>ul.submenu").slideUp("slow");
		if(width<475 && $("#sidebar").hasClass("default-sidebar")){
			$("#sidebar").removeClass("default-sidebar");
		}
	},
	"click #sidebar .menu-item>ul.submenu":function(e){
		// e.preventDefault();
		// $("ul.submenu").off("click");
		// console.log(e.currentTarget,e.target)
	},
	"click .nav-toggler":function(e){
		//track window width
		var width = window.innerWidth;
		if(width<475){
			$("#sidebar").toggleClass("default-sidebar");
		}else{
			$("#sidebar").toggleClass("no-sidebar");
			$("#main-content").toggleClass("full-width-content");
		}
	},
	"click #main-content,#sidebar":function(){
		$(`${notice},${inbox},${user}`).slideUp();
	},
	"click li.nav-item.dropdown-notification":function(e){
		$(`${inbox},${user}`).slideUp();
		$(`${notice}`).slideToggle();
	},
	"click li.nav-item.dropdown-inbox":function(e){
		$(`${notice},${user}`).slideUp();
		$(`${inbox}`).slideToggle();
	},
	"click li.nav-item.dropdown-user":function(e){
		$(`${notice},${inbox}`).slideUp();
		$(`${user}`).slideToggle();
	},
	'click #header-logout': function(e){
        e.preventDefault();
         g.logout();
    }
});

Template.dashboard.onDestroyed(function(){
	$(window).off("resize");
});