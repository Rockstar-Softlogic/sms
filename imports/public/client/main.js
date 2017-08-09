
import "./main.html";

Template.login.events({
    'submit .login-form': function (event) {
        event.preventDefault();
        $("#btn-login").text("Please wait...");
        var email = event.target.email.value;
        var password = event.target.password.value;
        Meteor.loginWithPassword(email,password,function(err, res){
            if(err){
               err.error == 403?$("#login-error").text("Invalid email or password"):$("#login-error").text("Login failed! Empty value.");
           		$("#login-error").slideDown("slow");
           		$("#btn-login").text("Login");
           		return false;
            }
        });
    },
    'click #logout': function(e){
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

Template.contact.events({
	'keydown #message': function(event){
		var max = 140;
        var len = $(this).val().length;
        if (len >= max) {
            $('#characterLeft').text('You have reached the limit');
            $('#characterLeft').addClass('red');
            $('#btnSubmit').addClass('disabled');            
        } 
        else {
            var ch = max - len;
            $('#characterLeft').text(ch + ' characters left');
            $('#btnSubmit').removeClass('disabled');
            $('#characterLeft').removeClass('red');            
        }
	}
});