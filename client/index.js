import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import './index.html'; // main body 
import '../imports/auth.js'; //Authenticated users client code

// //import flag-icon-css
// import 'flag-icon-css/css/flag-icon.min.css';
// //import popper for bootstrap
// import './popper';
// //import css from js. 
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap';
import 'bootstrap-sass';

//Template helpers and event
Template.login.events({
    'submit .login-form': function (event) {
        event.preventDefault();
        $("#btn-login").text("Please wait...");
        $("#btn-login").attr("disabled",true);
        var user = event.target.username.value;
        var password = event.target.password.value;
        Meteor.loginWithPassword(user,password,function(err, res){
            if(err){
               err.error == 403?$("#login-error").text("Invalid email/username or password"):$("#login-error").text("Login failed! Empty value.");
           		$("#login-error").slideDown("slow");
           		$("#btn-login").text("Login");
                $("#btn-login").attr("disabled",false);
           		return false;
            }else{
                Meteor.call("log"," logged in.",function(err,res){});
            }
        });
    },
    'click #logout': function(e){
    	e.preventDefault();
    	 g.logout();
    }
});
Template.networkStatus.helpers({
    networkStatus:function(){
        // console.log(Meteor.status());
        let status = Meteor.status();
        switch(status.status){
            case "connected":
                return status;
            case "connecting":
            case "waiting":
                status.waiting = true;
                return status;
            case "offline":
                status.canTryReconnect = true;
                return status;
        }
    },

});

Template.feedback.events({
    'submit form':function(e){
        e.preventDefault();
        let subject = e.target.subject.value,
            message = e.target.message.value,
            email = e.target.email?e.target.email.value:Meteor.user().username;
        
            if((subject.length < 5 || subject.length > 100) || message.length < 50 || !email){
                bootbox.alert("<h4>Error in message or subject </h4>");
                return;
            }
        let mailObject = {email:email,subject:subject,message:message};
        $("div.processRequest").show("fast");
        $.ajax({
            url:"https://formspree.io/wisdomabioye@gmail.com",
            method: "POST",
            data: mailObject,
            dataType: "json",
            success:function(data){
                if(data.success){
                    $("div.processRequest").hide("fast");
                    bootbox.alert("<h4>Message sent. Thank you!</h4>");
                    FlowRouter.go("/");
                }
            },
            error:function(data, error){
                $("div.processRequest").hide("fast");
                bootbox.alert("<h4>Error occurred! Please try again!</h4>");

            }
        });
    }
});