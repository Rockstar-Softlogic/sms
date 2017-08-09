
import "./auth.html";
import "./student/client/main.js";
import "./admin/client/main.js";

Template.dashboard.helpers({
	user: function(){
		var currentUser = Meteor.user();
		return currentUser;
	},
});

Template.dashboard.events({
	'click #header-logout': function(e){
    	e.preventDefault();
    	var confirmLogout = bootbox.confirm("You are about to logout, continue?", function(result){
    		if(result){
    			Meteor.logout(function(error){
	    			if(error){
	    				bootbox.alert(error);	
	    			}else{
	    				bootbox.alert("You're logged out. Thanks");	
	    			}
    			});
    		}
    	});
    }
});