import './main.html';
Template.studentLandingPage.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("log.list");
		});
});
Template.studentLandingPage.helpers({
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
Template.stResult.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("student.result");
			self.subscribe('student.info');
		});
});
Template.stResult.helpers({
	studentRes: function(){
		let s = g.setting();if(!s)return;//review
		let query = g.Results.findOne(),
			currentClass = g.Students.findOne().currentClass,
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
Template.stPayment.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("student.payment");
			self.subscribe('student.info');
			self.subscribe('staff.name');
		});
});
Template.stPayment.helpers({
	studentPay: function(){
		let s = g.setting();if(!s)return;//review
		let query = g.Payments.findOne(),
			currentClass = g.Students.findOne().currentClass,
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
			});
			if(filtered[0]){
				let staff = g.Staffs.findOne({"meteorIdInStaff":filtered[0].addedBy});
					staff?filtered[0].staffName=staff.lastName+" "+staff.firstName:filtered[0].staffName="Super Admin";
				return filtered[0];
			}
		}return;
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
Template.stAssignment.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("student.assignment");
		});
});
Template.stAssignment.helpers({
	'assignmentList': function(){
		let assFilter = Session.get('assFilter'), assignments;
		if(assFilter){
			assignments = g.Assignments.find({subject: assFilter}).fetch().reverse();
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
Template.stSingleAssignment.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("student.assignment");
			self.subscribe("st.staffName");
		});
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

Template.stLogs.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("log.list");
		});
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