//global functions and variables
g.classArray = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"];
g.monthArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
g.termArray = [1, 2, 3];
g.clubArray = ["Science", "Press", "Health", "Social", "Saviour"];
g.stateArray = ["FCT","Abia","Adamawa","Anambra","Akwa-Ibom","Bauchi", "Bayelsa","Benue","Cross-River","Delta","Ebonyi","Enugu","Edo","Ekiti","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"];
g.gradeArray = ["A", "B", "C", "D", "E", "F"];
g.remarkArray = ['Excellent', 'Credit', 'Pass', 'Fail', 'Not Offered'];
g.bloodGroupArray = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
g.genotypeArray = ["AA","AS","SS","AC","SC","CC"];
g.medicalConditionArray = ["Typhoid","Measles","Sickle cell","Tuberculosis","Asthma","HIV"];
g.subjectArray = ["English Language","Mathematics","Physics","Chemistry","Biology","Economics","Geography"];

//subjects Array
// g.subjectArray = g.Subjects.findOne({"_id":"default"});
// console.log(g.subjectArray);
// g.subjectArray = function(){
// 	if(Meteor.isClient){
// 		let config = Meteor.subscribe('subjects');
// 		if(config.ready()){
// 			let subj = g.Subjects.findOne({"_id":"default"});
// 			console.log(subj);
// 		}
// 	}
// }

//app setting
g.setting = function(){
	return g.Settings.findOne({_id:"default"});
}

//Session Array
g.sessionArray = function(start=2017){
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
			g.notice(error,8000,"alert-danger");
			if(submitBtnId)g.enableBtn(submitBtnId);
			return;
		}else{
			$("div.processRequest").hide("fast");
			if(successMsg)g.notice(successMsg,4000,"alert-success");
			if(submitBtnId)g.enableBtn(submitBtnId);
			if(redirect){
				//result would normally be 9 in length when returning an insert
				//else not an insert
				result?result.length>2?FlowRouter.go(redirect,{id:result}):FlowRouter.go(redirect):false;
			};
		}//end if
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
g.notice = function(text,time=8000,type="alert-info"){
	// let alert = "<h3><b>Notification</b></h3><hr/><br/><h4>"+text+"</h4>";
	//boostrap alert class
	$(".crudNotice").removeClass("alert-danger").addClass(type);
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
//logout function
g.logout = function(){
 	let confirmLogout = bootbox.confirm("<h4>You are about to logout, continue?</h4>", function(result){
            if(result){
            	Meteor.call("log","logged out!");
            	Meteor.logout(function(error){
                    if(error){
                        bootbox.alert(error);   
                    }else{
                        g.clearSession();
                    }
     		   });
            }
        });
}
//remove all session
g.clearSession = function(){
	Object.keys(Session.keys).forEach(function(key){
                    Session.set(key, undefined);
                });
        Session.keys = {};
        return;
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
g.getObjectKey = function(object){
	if(typeof object !== "object")return;
	let keyArray = [];
	for(let prop in object){
		keyArray.push(prop);
	}
	return keyArray;
}
g.objectToArray = function(object){
    let arr = [];
    for(let key in object){
     if(typeof object[key] === "object" /*&& g.subjectArray.indexOf(key)>-1*/){
	     arr.push({name:key,value:object[key]});
     }
    }
    return arr;
}

g.callbackOnClient = function(arrayOfOutput){
	if(Meteor.isClient){
		$("#callbackOnClient div").html("");
		arrayOfOutput.forEach(function(output){
			let former = $("#callbackOnClient div").html();
			$("#callbackOnClient div").html(former+"<p><b>"+output+"</b></p>");
		});
	}
}