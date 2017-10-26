import './main.html';
Template.studentLandingPage.helpers({
	allResults:function(){
		let result = g.Results.findOne();
		if(result && result.result){
			return result.result.length;
		}
		return 0;
	},
	allPayments:function(){
		let payment = g.Payments.findOne();
		if(payment && payment.payment){
			return payment.payment.length
		}
		return 0;
	},
	pendingPayment:function(){
		let s = g.setting();
		let student = g.Students.findOne();
		if(!student)return;
		let pending = g.Payments.findOne({"payment.term":s.term,"payment.session":s.session,"payment.class":student.currentClass});
		if(pending){return false}return true;
	},
	assignment:function(){
		let ass = g.Assignments.find({}).count();
		let answered = g.Assignments.find({"answer.id":Meteor.userId()}).count();
		let answeredAndMarked  = g.Assignments.find({"answer.id":Meteor.userId(),"answer.score":{$exists:true}}).count();
		return {total:ass, answered:answered, answeredAndMarked:answeredAndMarked, unanswered:(ass - answered)};
	},
	log:function(){
		let logs = g.Logs.find({},{limit:5}).fetch();
			if(!logs)return;
			logs.forEach(function(log){
				log.name = "You";
				return log;
			});
		return logs;
	}
});
Template.stResult.helpers({
	studentRes: function(){
		let s = g.setting();
		let query = g.Results.findOne(),
			currentClass = query.currentClass,
			requestedResult = Session.get('stRequestedResult');
		if(query.result){
			let filtered = query.result.filter(function(r){
					if(requestedResult && (requestedResult.class && requestedResult.term)){
						if(r.class === requestedResult.class && r.term == requestedResult.term){
							return r;
						}	
					}
					else if(r.class === currentClass && r.term == s.term){
						return r;
					}
					else if(r.class === "SSS3" && r.term == s.term){
						return r;
					}
			});
			return filtered[0];
		}return;
	},
	availableClass: function(){
		let classes = [];
		let data = g.Results.findOne();
		if(data.result){
			data.result.forEach(function(res){
					classes.push(res.class);
				});
			classes = classes.filter(function(item, pos){
				return classes.indexOf(item) == pos;
			});
			return classes;
		}return;
	},
});
Template.stResult.events({
	'submit form': function(e){
		e.preventDefault();
		let requestedClass = e.target.class.value;
		let requestTerm = e.target.term.value;
		let request = {class: requestedClass, term: requestTerm};
		Session.set('stRequestedResult', request);
	},
});
Template.stPayment.helpers({
	studentPay: function(){
		let s = g.setting();
		let query = g.Payments.findOne(),
			currentClass = query.currentClass,
			requestedPayment = Session.get('stRequestedPayment');
		if(query.payment){
			let filtered = query.payment.filter(function(p){
				if(requestedPayment && (requestedPayment.class && requestedPayment.term)){
					if(p.class === requestedPayment.class && p.term == requestedPayment.term){
						return p;
					}	
				}
				else if(p.class === currentClass && p.term == s.term){
					return p;
				}
				else if(p.class === "SSS3" && p.term == s.term){
					return p;
				}
			});
			if(filtered[0]){
				let payer = g.Staffs.findOne({"meteorIdInStaff":filtered[0].addedBy}) || g.Students.findOne({"meteorIdInStudent":filtered[0].addedBy});
					payer?filtered[0].payerName=payer.lastName+" "+payer.firstName:filtered[0].payerName="Super Admin";
				return filtered[0];
			}
		}return;
	},
	pendingPayment:function(){
		let s = g.setting();
		let student = g.Students.findOne();
		if(!student)return;
		let pending = g.Payments.findOne({"payment.term":s.term,"payment.session":s.session,"payment.class":student.currentClass});
		if(pending){return false}return true;
	},
	availableClass: function(){
		let classes = [];
		let data = g.Payments.findOne();
		if(data.payment){	
			data.payment.forEach(function(pay){
					classes.push(pay.class);
				});
			classes = classes.filter(function(item, pos){
				return classes.indexOf(item) == pos;
			});
			return classes;
		}return;
	},
});
Template.stPayment.events({
	'submit form': function(e){
		e.preventDefault();
		let requestedClass = e.target.class.value;
		let requestTerm = e.target.term.value;
		let request = {class: requestedClass, term: requestTerm};
		Session.set('stRequestedPayment', request);
	},
});
Template.stNewPayment.helpers({
	paymentInfo:function(){
		return Session.get("stPaymentInfo");
	},
	PaymentCategory:function(){
		let stPaymentInfo = {};
		let s = g.setting();
		let stInfo = g.Students.findOne();
		let	id = s.settingId,session = s.session,term = s.term;
		//get this term payments
		let query = g.Settings.findOne({"_id":id,"session":session}).term;
		let fees = query[query.length-1]; //attach current term school fees to session
		let transactionId = (stInfo.studentId+(new Date().toString().split(" ").join("").substring(0,20)).split(":").join(""));
		//get all payments category
		let	category = query.map(function(obj){
				for(let key in obj){
					if(typeof obj[key]==="object"){
						return key;
					}
				}
			});
			//if category, remove duplicate
			if(category.length){
				category = category.filter(function(item, pos){
					return category.indexOf(item) == pos;
				});
			}//end payment category.
		//create the session
		stPaymentInfo.fees = fees; stPaymentInfo.transactionId = transactionId;
		stPaymentInfo.currentClass = stInfo.currentClass; stPaymentInfo.studentId = stInfo.studentId;
		Session.set("stPaymentInfo",stPaymentInfo);
		//end create session
		return category;
	},
});
Template.stNewPayment.events({
	"submit #createPaymentReceipt":function(e){
		e.preventDefault();
		let paymentCat = e.target.paymentCat.value,
			stPaymentInfo = Session.get('stPaymentInfo');
			stPaymentInfo['paymentCategory'] = paymentCat;
			stPaymentInfo['amount'] = stPaymentInfo.fees[paymentCat][stPaymentInfo.currentClass];
			Session.set('stPaymentInfo',stPaymentInfo);
			$("#onlinePayment").show("slow");
	}
});
Template.stAssignment.helpers({
	'assignmentList': function(){
		let s = g.setting();
		let assFilter = Session.get('assFilter'), assignments;
		if(assFilter){
			assignments = g.Assignments.find({"subject":assFilter}).fetch().reverse();
		}else{
			assignments = g.Assignments.find().fetch().reverse();
		}
			//assignments = g.Assignments.find({$or: [{subject: assFilter.subject}, {endDate: {$lt: (new Date())}}]}).fetch().reverse();
			assignments.forEach(function(doc){
				let	date = new Date();
				//check assignment validity
				doc.validity = doc.endDate < date;
				if(doc.answer){
					doc.status = checkAnswer(doc.answer, Meteor.userId());					
				}
				return doc;
			});
		return assignments;
	},
});
Template.stAssignment.events({
	'submit form': function(e){
		e.preventDefault();
		let subject = e.target.subject.value;
		Session.set('assFilter', subject);
	},
});

Template.stSingleAssignment.helpers({
	assignment: function(){
		let id = FlowRouter.getParam('id'),
			thisAssignment = g.Assignments.findOne({_id: id});
		let staff = g.Staffs.findOne({meteorIdInStaff: thisAssignment.addedBy});
		if(staff){
			thisAssignment.author = (staff.firstName || '') + ', ' + (staff.lastName || '') + ' ' + (staff.otherName || '');
		}
		return thisAssignment;
	},
	stAnswer: function(){
		let id = FlowRouter.getParam('id'),
			filtered,
			query = g.Assignments.findOne({_id: id});
		if(query.answer){
			filtered = query.answer.filter(function(answer){
				if(answer.id == Meteor.userId()){
					return answer;
				}
			});
			return filtered[0];
		}
	},
	dueDate: function(){
		let id = FlowRouter.getParam('id'),
			query = g.Assignments.findOne({_id: id}),
			validity = new Date();
		if(query.endDate < validity){
			return true;
		}
	}
});
Template.stSingleAssignment.events({
	'submit form': function(e){
		e.preventDefault();
		let self = this;
		let id = FlowRouter.getParam('id'), answer;
			bootbox.confirm("<h4>You cannot edit after submission. Are you sure to submit?</h4>",function(result){
				if(result){
					let answer=e.target.answer.value;
					//attach answer
					self.answer = answer;
					g.meteorCall("submitAssignmentAnswer",{
						doc:self,
						successMsg:"You answer was submitted"
					});
					e.target.answer.value = "";	
				}
			});
	}
});
Template.stNewMessage.helpers({
	staff: function(){
		return g.Staffs.find();
	},
})
Template.stNewMessage.events({
	'submit form': function(e){
		e.preventDefault();
		let staff = e.target.staff.value,
			msgTitle = e.target.title.value,
			msgBody = e.target.body.value;
		let msgObj = {"toStaff":[staff],"subject":msgTitle,"content":msgBody};
		g.meteorCall("stNewMessage",{doc:msgObj,
				successMsg:"Your message was sent successfully.",
				redirect:"stSingleMessage"});
		// e.target.title.value = e.target.body.value = "";
	},
});
Template.stSingleMessage.onRendered(function(){
	Meteor.call("markMessageAsRead",FlowRouter.getParam("id"));
});
Template.stSingleMessage.helpers({
	message: function(){
		let id = FlowRouter.getParam('id');
		let msg = g.Messages.findOne({"_id":id});
			if(msg.staffName){
				msg.staffName = msg.staffName;
			}else{
				msg.staffName = 'Unknown Recipient';
			}
		return msg;
	},
	msgReply: function(){
		let id = FlowRouter.getParam("id");
		let msg = g.Messages.findOne({"_id":id});
			if(msg && msg.replies){
				return msg.replies.reverse();	
			}
		return false;
	},
	count: function(){
		let id = FlowRouter.getParam("id");
		let replies = g.Messages.findOne({"_id":id}).replies;
		if(replies){
			return replies.length;	
		}else{
			return 0;
		}
	},
});
Template.stSingleMessage.events({
	'submit form': function(e){
		e.preventDefault();
		let id = FlowRouter.getParam("id");
		let reply = e.target.reply.value;
		let doc = {id:id,reply:reply};
		g.meteorCall("stReplyMessage",{doc:doc,
			successMsg:"Your reply was submitted."});
		e.target.reply.value="";
	},
});
Template.stInboxMessage.helpers({
	inboxMsg: function(){
		let userId = Meteor.userId(),
			student = g.Students.findOne({"meteorIdInStudent":userId}) || g.Graduates.findOne({"meteorIdInStudent":userId}),
			currentClass = student.currentClass,
			inboxFilter = Session.get("stInboxFilter"),inbox;
			if(inboxFilter==="unread"){
				inbox = g.Messages.find({"toClass":currentClass,"readBy":{$ne:userId}}).fetch().reverse();
			}else if(inboxFilter==="read"){
				inbox = g.Messages.find({"toClass":currentClass,"readBy":userId}).fetch().reverse();
			}else{
				inbox = g.Messages.find({"toClass":currentClass}).fetch().reverse();
			}
			if(inbox){
				inbox.forEach(function(msg){
					msg.senderName = msg.senderName.substr(0, 10)+"..." || '[Unknown sender]';
					msg.subject = msg.subject.substr(0, 30)+"..." || '[No subject]';
					msg.read = msg.readBy.indexOf(userId)>-1?"fa fa-check text-success":"fa fa-envelope text-info";
					if(msg.replies){
						msg.count = msg.replies.length;
					}
					return msg;
				});
				return inbox;	
			}
	},
	inboxCount: function(){
		let userId = Meteor.userId(),
			student = g.Students.findOne({"meteorIdInStudent":userId}) || g.Graduates.findOne({"meteorIdInStudent":userId}),
			currentClass = student.currentClass;
		let count = g.Messages.find({"toClass":currentClass}).count();
		let read = g.Messages.find({"toClass":currentClass,"readBy":userId}).count();
		let unread = count - read;
		return {'count':count,'unread':unread,'read':read};
	}
});
Template.stInboxMessage.events({
	'click .inboxBtn':function(){
		Session.set('stInboxFilter',"inbox");
	},
	'click .unreadBtn':function(){
		Session.set('stInboxFilter',"unread");
	},
	'click .readBtn':function(){
		Session.set('stInboxFilter',"read");
	},
});
Template.stSentMessage.helpers({
	sentMsg: function(){
		let userId = Meteor.userId(),
			sent = g.Messages.find({"senderId":userId}).fetch().reverse();
				if(sent){
					sent.forEach(function(data){
						if(data.staffName){
							data.staffName = data.staffName.join(", ").substr(0, 10)+"...";
						}else{
							data.staffName = '[Unknown recipient]';
						}
						data.subject = data.subject.substr(0, 30) + '...' || '[No subject]';
						if(data.replies){
							data.count = data.replies.length;
						}
						return data;
					});
					return sent;
				}
	},
	sentCount: function(){
		let userId = Meteor.userId();
		let count = g.Messages.find({"senderId":userId}).count();
		return count;
	}
});

Template.stLogs.helpers({
	log:function(){
		let logs = g.Logs.find({},{limit:50}).fetch();
			if(!logs)return;
			logs.forEach(function(log){
				log.name = "You";
				return log;
			});
		return logs;
	}
});
////////////////////////autoform hooks///////////////////////////////////
AutoForm.hooks({
	editStProfile:{
		onSubmit: function(data){
			this.event.preventDefault();
			g.meteorCall("updateStudentProfile",{
				doc:data,
				submitBtnId:"#editStProfile",
				successMsg:"Profile updated successfully",
				redirect:"studentProfile"
			});
		}
	}
});
function checkAnswer(answerObject, id){
	var bool = false;
	for(var i = 0; i < answerObject.length; i++){
		if(answerObject[i]['id'] == id){
			bool = true
			break;
		}else{
			continue;
		}
	}
	return bool;
}