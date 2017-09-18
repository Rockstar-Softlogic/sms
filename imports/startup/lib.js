//global functions and variables
g.subjectArray = ["English", "Mathematics", "Physics", "Chemistry", 'Biology', 'Geography', 'Economics','Computer', 'Agric', 'Civic', 'Commerce', 'Accounting', 'Government'];
g.classArray = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"];
g.monthArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
g.termArray = [1, 2, 3];
g.clubArray = ["Science", "Press", "Health", "Social", "Saviour"];
g.stateArray = ["Abia","Adamawa","Akwa-Ibom","Anambra","Bauchi"];
g.gradeArray = ["A", "B", "C", "D", "E", "F"];
g.remarkArray = ['Excellent', 'Credit', 'Pass', 'Fail', 'Not Offered'];
//app setting
g.setting = function(){
	if(Meteor.isClient){
		let config = Meteor.subscribe('setting');
		if(config.ready()){
			return g.Settings.findOne({_id:"default"});
		}
	}
}
//Session Array
g.sessionArray = function(start=2016){
		start = Number(start),
		now = new Date().getFullYear(),
		list = [];
	for(start; start <= now; start++){
		list.push(start + "/"+(start+1));	
	}
	return list.reverse();
}
g.yearsArray = function(start=2016){
		start = Number(start);
	let years = [],
		now = new Date().getFullYear();
	for(start; start<=now; start++){
		years.push(start);
	}
	return years.reverse();
}
//Meteor.call wrapper doc="",submitBtnId,successMsg,redirect
g.meteorCall = function(method,options){
	options = options || {};
	let doc = options.doc,
		submitBtnId = options.submitBtnId,
		successMsg = options.successMsg,
		redirect = options.redirect;

	$("div.processRequest").show("fast");
	Meteor.call(method,doc,function(error,result){
		if(error){
			$("div.processRequest").hide("fast");
			g.notice(error,8000);
			if(submitBtnId)g.enableBtn(submitBtnId);
			return;
		}else{
			$("div.processRequest").hide("fast");
			g.notice(successMsg,4000);
			if(submitBtnId)g.enableBtn(submitBtnId);
			if(redirect){
				result.length>2?FlowRouter.go(redirect,{id:result}):FlowRouter.go(redirect);
				
			};
		}
	});
}
//exam result calculator
g.countCorrectAnswer = function(answers){
	var correct = wrong = 0;
		for(var i = 0; i < answers.length; i++){
			if(answers[i].mark=="correct")correct++;
			else wrong++;
		}
	return correct;
}

g.promoteStudents = function(currentClass){
	switch(currentClass){
		case "JSS1":
			return "JSS2";
		case "JSS2":
			return "JSS3";
		case "JSS3":
			return "SSS1";
		case "SSS1":
			return "SSS2";
		case "SSS2":
			return "SSS3";
		case "SSS3":
			return "Graduated";
		default:
			return currentClass;
	}
}
g.demoteStudents = function(currentClass){
	switch(currentClass){
		case "Graduated":
			return "SSS3";
		case "SSS3":
			return "SSS2";
		case "SSS2":
			return "SSS1";
		case "SSS1":
			return "JSS3";
		case "JSS3":
			return "JSS2";
		case "JSS2":
			return "JSS1";
		default:
			return currentClass;
	}
}
//Sentence case
g.sentenceCase = function(name){
	if(typeof(name) === "string"){
		var cased = [];
		name.split(" ").forEach(function(n){
			cased.push(n[0].toUpperCase() + n.substring(1).toLowerCase()); 
		});
		return cased.join(" ");
	}
	return name;
}
//check empty object
g.isEmptyObject = function(obj){
	for(var key in obj){
		if(Object.prototype.hasOwnProperty.call(obj, key)){
			return false;
		}
	}
	return true;
}
//re enable submit button on error
g.enableBtn = function(id){
	return $(id+" button[type='submit']").attr("disabled",false);
}
//bottom right corner notice
g.notice = function(text, time = 10000){
	let alert = "<h3><b>Notification</b></h3><hr/><br/><h4>"+text+"</h4>";
	$('.crudNotice div').text(text);
	$('.crudNotice').show("slow");
	// bootbox.alert(alert);
	setTimeout(function(){
		$('.crudNotice').fadeOut(3000);
			}, time);
}
 g.termSuffix = function(term){
	    switch(term){
	    case 1:
	        term="1st";
	        break;
	    case 2:
	        term="2nd";
	        break;
	    case 3:
	        term="3rd";
	    }
       return term;
 },
//countdown timer
g.CountDown = function(minute){
	this.now = new Date(),
	this.totalMin = this.now.getMinutes()+minute,
	this.seconds = this.now.getSeconds(),
	this.endHours = Math.floor(this.totalMin/60),
	this.endMinutes = this.totalMin - (this.endHours*60),
	this.endTime = this.now.getHours()+this.endHours+":"+this.endMinutes,
	this.hoursDiff = Math.floor(minute/60),
	this.minutesDiff = minute - (this.hoursDiff*60),
	this.timeDiff = this.hoursDiff+":"+this.minutesDiff,
	this.countDownDiff = function(){
			var sec = 0//this.seconds,
				min = this.minutesDiff,
				hr = this.hoursDiff,
				trackSec = 0,//auto submit seconds
				trackMin = 0,//auto submit minute
				trackHr = 0;//auto submit hour
		Meteor.setTimeout(function count(){
			var loc = window.location.pathname.split("#")[0].split("/");
			if(loc[loc.length-1].length==17&&loc[loc.length-2]=="do"){
				if(sec < 0){
					sec = 59;//reset seconds to 59
					min--;
				}
				if(min < 0){
					min = 59;//reset minutes to 59
					hr--;
				}
				if(hr < 0){
					hr = 23;//reset hour to 23
				}
				if(sec<10)sec="0"+sec; //a digit to 2 digits;
				if(min<10)min="0"+Math.abs(min);
				if(hr<10)hr="0"+Math.abs(hr);
				$(".count .timeCount h3").text(hr+":"+min+":"+sec);
				sec--;
				if(sec==trackSec&&min==trackMin&&hr==trackHr){
					new Audio(window.location.origin+"/times_up.mp3").play();
					$("form#questionsList").submit();
					$(".count .timeCount span").html("<b>Time's up!</b>");
					Meteor.clearTimeout(count);
					return;
				}
				if((min == 5 && sec == 0) || (min == 10 && sec == 0) || (min < 1 && sec < 30)){
					new Audio(window.location.origin+"/times_up.mp3").play();
				}
				Meteor.setTimeout(count,1000);
			}else{
					Meteor.clearTimeout(count);
			}
		}, 1000);
	}
}

//logout function
g.logout = function(){
 	let confirmLogout = bootbox.confirm("You are about to logout, continue?", function(result){
            if(result){
            	Meteor.call("log","logged out!");
            	Meteor.logout(function(error){
                    if(error){
                        bootbox.alert(error);   
                    }else{
                        Object.keys(Session.keys).forEach(function(key){
                            Session.set(key, undefined);
                        });
                        Session.keys = {};
                        return;
                    }
     		   });
            }
        });
}
//remark function
g.remark = function(grade){
	switch (grade) {
		case 'A':
		case 'A1':
			return "Excellent";
		case 'B':
		case 'B2':
		case 'B3':
		case 'C':
		case 'C4':
		case 'C5':
		case 'C6':
			return "Credit";
		case 'D':
		case 'D7':
		case 'E':
		case 'E8':
			return "Pass";
		case 'F':
			return "Fail";
		default:
			return "Not Offered";
	}
}
//Grade Calculator
g.calculateGrade = function(num){
	if(num >= 70) return "A";
	else if(num >= 60) return "B";
	else if(num >= 50) return "C";
	else if(num >= 45) return "D";
	else if(num >= 40) return "E";
	else return "F";

}