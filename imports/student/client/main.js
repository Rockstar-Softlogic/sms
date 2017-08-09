import './main.html';

let monthArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

Template.stDashboard.onCreated(function(){
	let self = this;
	self.autorun(function(){
		self.subscribe('student.info');
	});
});

Template.stDashboard.helpers({
	studentInfo: function(){
		let data = g.Students.findOne();
		return data;
	}
});



Template.studentProfile.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('student.info');
	});
});

Template.studentProfile.helpers({
	studentInfo: function(){
		let data = g.Students.findOne();
		return data;
	}
});

Template.editStProfile.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('student.info');
		});
});

Template.editStProfile.helpers({
	editable: function(){
		let profile = g.Students.findOne();
		return profile;
	},
});

Template.stResult.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("student.result");
			self.subscribe('student.info');
			self.subscribe('setting');
		});
});

Template.stResult.helpers({
	studentRes: function(){
		let query = g.Results.findOne(),
			currentClass = g.Students.findOne().currentClass,
			requestedResult = Session.get('stRequestedResult'),
			gTerm = g.Settings.findOne({_id: "default"}).term;

		if(query.result){
			let filtered = query.result.filter(function(r){
					if(requestedResult && (requestedResult.class && requestedResult.term)){
						if(r.class === requestedResult.class && r.term == requestedResult.term){
							return r;
						}	
					}
					else if(r.class === currentClass && r.term == gTerm){
						return r;
					}
			});
			return filtered[0];
		}return;
	},

	studentInfo: function(){
		let data = g.Students.findOne();
		return data;
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
	currentTerm: function(){
		let gTerm = g.Settings.findOne({_id: "default"}).term;
		switch(gTerm){
			case 1:
				return '1st';
			case 2:
				return '2nd';
			case 3:
				return '3rd';
		}
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
			self.subscribe('setting');
		});
});

Template.stPayment.helpers({
	studentPay: function(){
		let query = g.Payments.findOne(),
			currentClass = g.Students.findOne().currentClass,
			requestedPayment = Session.get('stRequestedPayment'),
			gTerm = g.Settings.findOne({_id: "default"}).term;

		if(query.payment){
			let filtered = query.payment.filter(function(p){
					if(requestedPayment && (requestedPayment.class && requestedPayment.term)){
						if(p.class === requestedPayment.class && p.term == requestedPayment.term){
							return p;
						}	
					}
					else if(p.class === currentClass && p.term == gTerm){
						return p;
					}
			});
			return filtered[0];
		}return;
	},

	studentInfo: function(){
		let data = g.Students.findOne();
		return data;
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
	currentTerm: function(){
		let gTerm = g.Settings.findOne({_id: "default"}).term;

		switch(gTerm){
			case 1:
				return '1st';
			case 2:
				return '2nd';
			case 3:
				return '3rd';
		}
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
				
				let	sDate = doc.startDate,
					eDate = doc.endDate;
					doc.startDate = sDate.getDate() + "-" + monthArr[sDate.getMonth()] + "-" + sDate.getFullYear();
					doc.endDate = eDate.getDate() + "-" + monthArr[eDate.getMonth()] + "-" + eDate.getFullYear();
					
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
			thisAssignment = g.Assignments.findOne({_id: id}),
			sDate = thisAssignment.startDate,
			eDate = thisAssignment.endDate;

			thisAssignment.startDate = sDate.getDate() + "-" + monthArr[sDate.getMonth()] + "-" + sDate.getFullYear();
			thisAssignment.endDate = eDate.getDate() + "-" + monthArr[eDate.getMonth()] + "-" + eDate.getFullYear();
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
		let id = FlowRouter.getParam('id'), answer,
			confirmSubmit = confirm("You cannot edit after submission. Are you sure to submit?");
			confirmSubmit?answer=e.target.answer.value:answer;
		Meteor.call('submitAssignmentAnswer', this, answer, function(error){
			if(error){
				insertNotice(error, 8000);
				return false;
			}else{
				e.target.answer.value = "";
				insertNotice("You answer was submitted", 4000);
			}
		});
		
	}

});

////////////////////////autoform hooks///////////////////////////////////
AutoForm.hooks({
	editStProfile:{
		onSubmit: function(data){
			this.event.preventDefault();
			Meteor.call('updateStudentProfile', data, function(error){
				if(error){
					insertNotice("Error occurred: " + error, 4000);
				}else{
					insertNotice("Profile updated successfully", 4000);
					let pathToGo = FlowRouter.path('/st/dashboard');
						FlowRouter.go(pathToGo);
				}
			});
		}
	}
});

function insertNotice(text, time = 3000){
	$('.insertNotice').text(text);
	$('.insertNotice').show('slow');
	setTimeout(function(){
		$('.insertNotice').fadeOut(3000);
			}, time);
}

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