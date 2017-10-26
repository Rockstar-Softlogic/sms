Meteor.startup(function() {
	var theURL = "http://rssl-smsapp.herokuapp.com/";
	if (process.env.NODE_ENV === "development") {
        theURL = "http://localhost:3000";
    }
    Meteor.absoluteUrl.defaultOptions.rootUrl = theURL;
    process.env.ROOT_URL = theURL;
    process.env.MOBILE_ROOT_URL = theURL;
    process.env.MOBILE_DDP_URL = theURL;
    process.env.DDP_DEFAULT_CONNECTION_URL = theURL;
});

Meteor.methods({
	updateStudentProfile: function(data){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['student'])){
			throw new Meteor.Error('500', 'Unauthorized Operation');
		}
		let userId = this.userId,
			stUpdate = g.Students.update({meteorIdInStudent: userId},{$set:data});
		if(stUpdate){
			Meteor.call("log","updated profile (self)");
			return stUpdate;
		}else{
			throw new Meteor.Error("501","Graduated student is not allowed to update profile.");
		}
	},
	newPaymentByStudent:function(doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['student'])){
			throw new Meteor.Error(500, 'Unauthorized Operation');
		}
		let setting = g.Settings.findOne({"_id":"default"});
			if(!setting || !setting.session || !setting.term){
				throw new Meteor.Error(501, "No Session or term found. Contact the admin.");
			}
		if(Meteor.isServer){
			let userId = this.userId;
			let student = g.Students.findOne({
					"meteorIdInStudent":userId,
					"studentId":doc.studentId});
			let payment = {};//build payment object securely
					payment.class = student.currentClass;
					payment.term = setting.term;
					payment.session = setting.session;
					payment.category = doc.paymentCategory;
					payment.transactionId = doc.transactionId;
					payment.amount = doc.amount;
					payment.paymentStatus = "Paid";
					payment.paymentType = "Online";
					payment.paid = true;
					payment.date = new Date();
					payment.addedBy = this.userId;
					// from payment gateway response
					payment.approvedAmount = doc.response.apprAmt;
					payment.paymentDescription = doc.response.desc;
					payment.payRef = doc.response.payRef;
			let paymentUpdate = g.Payments.update({
								"meteorIdInStudent":student.meteorIdInStudent,
								"studentId":student.studentId},
								{$push:{"payment":payment}});
			//log this action
			if(paymentUpdate){
				Meteor.call("log",("made online payment for "+student.currentClass+" "+g.termSuffix(setting.term)+" term"));
			}
		}//payment
	},
	'submitAssignmentAnswer': function(doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['student'])){
				throw new Meteor.Error('500', 'Unauthorized Operation');
			}
		let stAnswer = doc.answer;
		delete doc.answer;
		if(stAnswer.length > 40){
			let userId = this.userId,
				currentClass = g.Students.findOne({'meteorIdInStudent':userId}).currentClass;
			let endDate = g.Assignments.findOne({'class':currentClass,
										'_id':doc._id,
										'subject':doc.subject}).endDate;
			if(endDate < (new Date())){
				throw new Meteor.Error('Unauthorized submission', 'Assignment has expired. No submission is allowed.');
			}
			let obj = {"id": userId, "text": stAnswer, "date": new Date()};
			let updateAnswer = g.Assignments.update({'class':currentClass,
							'_id': doc._id,
							'subject':doc.subject},
							{$addToSet:{'answer': obj}});
			if(updateAnswer){
				Meteor.call("log","submitted answer for "+doc.subject+" assignment.");
				return updateAnswer;	
			}
		}else{
			throw new Meteor.Error("Invalid answer", "Please review your answer, too short or empty answer!");
		}
	},
	stNewMessage: function(message){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['student'])){
			throw new Meteor.Error(500, 'Unauthorized Operation');
			}
		if(typeof message !== "object"){
			throw new Meteor.Error(500, 'Invalid message received');
		}
		let staff = g.Staffs.findOne({"meteorIdInStaff":message.toStaff[0]});
			message.staffName = (staff.firstName || " ") + " " + (staff.lastName || " ")+ " "+(staff.otherName || " ");
		let sender = g.Students.findOne({"meteorIdInStudent":this.userId}) || g.Graduates.findOne({"meteorIdInStudent":this.userId});
			message.senderName = (sender.lastName || ' ') + ' ' + (sender.firstName || ' ') + ' ' + (sender.otherName || ' ')+" ("+(sender.studentId)+" "+sender.currentClass+")";
			message.readBy = []; message.readBy.push(this.userId);
		let msgInsert = g.Messages.insert(message);
			Meteor.call("log",("created new a message '"+message.subject+"'"));
		return msgInsert;
	},
	stReplyMessage: function(doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['student'])){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}
		if(!doc.reply || doc.reply.length < 5){
				throw new Meteor.Error(401, 'Reply too short. At least 5 characters.');
		}
		let userId = this.userId, student, studentName;
		if(Meteor.isServer){
			student = g.Students.findOne({"meteorIdInStudent":userId}) || g.Graduates.findOne({"meteorIdInStudent":userId});
			studentName = (student.lastName || "") + " " + (student.firstName || "") + " " + (student.otherName || "") +" ("+student.studentId+")";
		}
		let replyObj = {"reply":doc.reply,"userId":userId,"name":studentName, "replyDate":new Date()};
		let msgUpdate = g.Messages.update({"_id": doc.id},{$push:{"replies":replyObj}});
		let messageSubject = g.Messages.findOne({"_id":doc.id}).subject;
			Meteor.call("log",("replied to a message with subject '"+messageSubject+"'"));
		return msgUpdate;
	},
});