import "./auth.html";
import "./startup/globalHelpers.js";
import "./student/client/main.js";
import "./admin/client/main.js";

Template.header.events({
    'click #header-logout': function(e){
        e.preventDefault();
         g.logout();
    }
});
Template.stSidebar.events({
	 'click #logout': function(e){
    	e.preventDefault();
    	 g.logout();
    }
});