import './main.html';

let monthArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];



Template.admin.onCreated(function(){
	let self = this;
	self.autorun(function(){
		self.subscribe('setting');
	});
});

Template.admin.helpers({
	termSchoolFees: function(){
		let session = g.Settings.findOne({_id: "default"}).session;
		let term = g.Settings.findOne({_id: "default"}).term;
		let id = g.Settings.findOne({_id: "default"}).settingId;
			
		let query = g.Settings.findOne({_id: id, session: session});
		let filtered = query.term.filter(function(current){
				if(current.currentTerm == term && current.schoolFees.currentTerm == term){
					return current;
				}
		});
			return filtered[0]
		
	},
	currentSession: function(){
		let gSession = g.Settings.findOne({_id: 'default'}).session;
			return gSession;
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

Template.admin.events({
	'click .promoteAll button': function(){
		let verify = confirm('You\'re about to promote all students in the school. Are you sure?');
			if(verify){
				Meteor.call('promoteStudent', function(error){
					if(error){
						alert(error.error);
					}
					else alert("All students have been promoted");
				});
			}return;
	},

	'click #addSession': function(){
		Modal.show('newSessionModal', function(){return;}, {backdrop: 'static', keyboard: false});
	},

	'click #addTerm': function(){
		Modal.show('setTermAndSchoolFees', function(){return;}, {backdrop: 'static', keyboard: false});
	}

});

Template.newSessionModal.onCreated(function(){
	let self = this;
	self.autorun(function(){
		self.subscribe('setting');
	});
});

Template.newSessionModal.helpers({
	sessionInfo: function(){
		let obj = {};

			obj['session'] = g.Settings.findOne({_id: "default"}).session;
			obj['term'] = g.Settings.findOne({_id: "default"}).term;
			obj['id'] = g.Settings.findOne({_id: "default"}).settingId;

			return obj;

	},

});

Template.newSessionModal.events({
	
});

Template.setTermAndSchoolFees.onCreated(function(){
	let self = this;
	self.autorun(function(){
		self.subscribe('setting');
	});
});

Template.setTermAndSchoolFees.helpers({
	sessionInfo: function(){
		let obj = {};

			obj['session'] = g.Settings.findOne({_id: "default"}).session;
			obj['term'] = g.Settings.findOne({_id: "default"}).term;
			obj['id'] = g.Settings.findOne({_id: "default"}).settingId;

			return obj;

	},

});

Template.setTermAndSchoolFees.events({
	

});


//Each staff Profile page

Template.staffProfile.onCreated(function(){
	let self = this;
	self.autorun(function(){
		self.subscribe('staff.info');

	});
});

Template.staffProfile.helpers({
	staffInfo: function(){
		let data = g.Staffs.findOne();
		return data;
	}
});


//End Each staff Profile page
// **********************///
// **********************///
// ******BREAK Brea******///
// **********************///
// **********************///

//List of Staff in School
Template.staffList.onCreated(function(){
	let self = this;
	self.autorun(function(){
		self.subscribe('staff.list');

	});
});

Template.staffList.helpers({
	staffs: function(){
		let getFilter = Session.get('staffFilter');
			if(getFilter && (getFilter.name || getFilter.staffId)){
				return g.Staffs.find({$or: [{staffId: getFilter.staffId},
												{fullName: /getFilter.name/i}]});
				}
		return g.Staffs.find({});
	},
});

Template.staffList.events({
	'submit form': function(e){
			e.preventDefault();
			let name = e.target.name.value;
			let staffId = e.target.staffId.value;
			let filter = {name: name,
						staffId: staffId};
			Session.set('staffFilter', filter);
	},

});


Template.singleStaff.onCreated(function(){
	let self = this;
	self.autorun(function(){
		self.subscribe('staff.list');

	});
});

Template.singleStaff.helpers({
	staff: function(){
		let id = FlowRouter.getParam('id');
		let data = g.Staffs.findOne({staffId: id});
		return data;
	},
});

//editing and update staff
Template.editStaff.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('staff.list');
		});

});

Template.editStaff.helpers({
	editStaffInfo: function(){
		let id = FlowRouter.getParam('id');
		return g.Staffs.findOne({staffId: id});
	},
});



Template.updateStaff.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('staff.list');
		});

});

Template.updateStaff.helpers({
	updateStaffInfo: function(){
		let id = FlowRouter.getParam('id');
		return g.Staffs.findOne({staffId: id});
	},
});

//End List of Staff in School

// **********************///
// **********************///
// ******BREAK Break******///
// **********************///
// **********************///
//passport upload events and helpers

Template.passportUpload.helpers({
	uploadInfo: function(){
		let getInfo = Session.get('passportTarget');
			return getInfo;
	},
});

Template.passportUpload.events({

	'change input#file': function(event){
		let file = event.target.files[0];
			if(!file) return;

			let allowedFormat = ["image/png", "image/jpg"],
				maxSize = 51200,
				minSize = 5120,
				error = checkFile(file, allowedFormat, minSize, maxSize);

				if(error){
					insertNotice(error, 8000);
					return false;
				}

			//read the file if valid
			let maxHeight = 310, maxWidth = 250;

			let reader = new FileReader();
				reader.onload = function(e){
					let image = document.createElement('img');
						image.onload = function(){

								if((image.width || image.naturalWidth) > maxWidth){
									insertNotice('Image width cannot be greater than ' + maxWidth, 6000);
									$('#uploadBtn').hide('slow');
									$('#passportPreview').html("<strong>Invalid passport <br/> width &gt; </strong>"+maxWidth);
									return false;
								}else if((image.height || image.naturalHeight) > maxHeight){
									insertNotice('Image height cannot be greater than ' + maxHeight);
									$('#uploadBtn').hide('slow');
									$('#passportPreview').html("<strong>Invalid passport <br/> height &lt; </strong> "+maxHeight);
									return false;
								}
								$('#passportPreview').html(image);
								$('#uploadBtn').fadeIn('slow');
						}

						image.onerror = function(){
							$('#file').hide('fast');
							$('#passportPreview').html("You selected a file renamed to an image extension. <br/>Do you know what you're doing? <br/> Don't go against the rule.");
							return false;
						}		
						image.src = e.target.result;
				}
				reader.readAsDataURL(file);
		

	},
	'click button#uploadBtn': function(){
			let preview = $('#passportPreview img').attr('src');
				if(preview.length < 100){
					insertNotice("You've not selected any file to upload");
					return false;
				}
			let file = document.getElementById('file').files[0];
				if(!file) return;

			let reader = new FileReader();
				reader.onload = function(e){
					let content = e.target.result.split(",")[1],
						target = Session.get('passportTarget'),
						ext = e.target.result.split(",")[0],
						next;

						ext = "."+ext.split("/")[1].slice(0, 3);

					Meteor.call('uploadPassport', (target.id)+ext, content, function(err, result){
						if(err){
							insertNotice("error occurred", err);
							return false;
						}
					else{
						let pathToGo = target.diff;
						if(pathToGo == 'student'){
							insertNotice("Passport uploaded successfully", 4000);
							next = FlowRouter.path('/student/view/'+target.id);
									FlowRouter.go(next);
						}else if(pathToGo == 'staff'){
							insertNotice("Passport uploaded successfully", 4000);
							next = FlowRouter.path('/staff/view/'+target.id);
									FlowRouter.go(next);}
						}
						
					});
				}
				reader.readAsDataURL(file);
	},
});



//function check file format and size
function checkFile(file, format, minSize = 0, maxSize){
	let error;

	if(format.indexOf(file.type) < 0){
		error = "Passport can only be in jpg or png format.";
	}else if(file.size > maxSize){
		error = "File cannot be greater than 50kb, try another file.";
	}else if(file.size < minSize){
		error = "File cannot be less than 5kb";
	}
	return error;

}

// **********************///
// **********************///
// ******BREAK Break******///
// **********************///
// **********************///
//List of student in School
Template.studentList.onCreated(function(){
	let self = this;
	self.autorun(function(){
		self.subscribe('student.list');

	});
});

Template.studentList.helpers({
	students: function(){
		let getFilter = Session.get('studentFilter');
			if(getFilter && (getFilter.selectedClass || getFilter.studentId || getFilter.name)){
				return g.Students.find({$or: [{currentClass: getFilter.selectedClass},
												{studentId: getFilter.studentId},
												{fullName: {$regex: /getFilter.name/i}}]}).fetch();
			}
		return g.Students.find({currentClass: "JSS1"});
	},
});

Template.studentList.events({
	'submit form': function(e){
			e.preventDefault();
			let name = e.target.name.value;
			let studentId = e.target.studentId.value;
			let selectedClass = e.target.class.value;
			let filter = {name: name,
						studentId: studentId,
						selectedClass: selectedClass};
			Session.set('studentFilter', filter);
	},
	'click .selectedStudent': function(e){
		bootbox.alert('e.target.selectSt.value');
	}
});

//End List of student in School
//Single student view page
Template.singleStudent.onCreated(function(){
	let self = this;
	self.autorun(function(){
		self.subscribe('student.list');
		self.subscribe('setting');


	});
});

Template.singleStudent.helpers({
	student: function(){
		let id = FlowRouter.getParam('id');
		let data = g.Students.findOne({studentId: id});
		return data;
	},
});

//End Single student view

//edit student template
Template.editStudent.onCreated(function(){
	let self = this;
	self.autorun(function(){
		self.subscribe('student.list');
	});
});

Template.editStudent.helpers({
	editStudentInfo: function(){
		let id = FlowRouter.getParam('id');
		return g.Students.findOne({studentId: id});
	}
});

//edit student template


//update student template
Template.updateStudent.onCreated(function(){
	let self = this;
	self.autorun(function(){
		self.subscribe('student.list');
	});
});

Template.updateStudent.helpers({
	updateStudentInfo: function(){
		let id = FlowRouter.getParam('id');		
		return g.Students.findOne({studentId: id});
	}
});



//update student template

// **********************///
// **********************///
// ******BREAK Break******///
// **********************///
// **********************///

Template.resultList.onCreated(function(){
	let self = this;
	self.autorun(function(){
		self.subscribe('lastResult.check');
		self.subscribe('setting');

	});
});


Template.resultList.helpers({
	results: function(){
		let getFilter = Session.get('resultFilter');
			if(getFilter && (getFilter.selectedClass || getFilter.studentId || getFilter.name)){
				return g.Results.find({$or: [{currentClass: getFilter.selectedClass},
												{studentId: getFilter.studentId},
												{fullName: {$regex: /getFilter.name/i}}]}).fetch();
			}
		return g.Results.find({currentClass: "JSS1"});
		
	},
	resultAvailable: function(){
		let bool = false;
		let query = g.Results.find({}).map(function(each){
				each.result;
		});
				if(query.length){
					bool = true;
				}
		return bool;
	},		
});

Template.resultList.events({
	"click .addResult": function(){
			let query = {name: (this.lastName || " ") +", "+(this.firstName || " ") +" "+ (this.otherName || " "), 
						studentId: this.studentId || undefined,
						currentClass: this.currentClass || undefined,
						target: this.meteorIdInStudent || undefined,
					};
			Session.set('st.info', query);

	},

	'submit form': function(e){
			e.preventDefault();
			let name = e.target.name.value;
			let studentId = e.target.studentId.value;
			let selectedClass = e.target.class.value;
			let filter = {name: name,
						studentId: studentId,
						selectedClass: selectedClass};
			Session.set('resultFilter', filter);
	},

});




Template.singleResult.onCreated(function(){
	let self = this;
	self.autorun(function(){
		self.subscribe('result.list');
		self.subscribe('student.list');
		self.subscribe('setting');

	});
});

Template.singleResult.helpers({
	singleRes: function(){
		let id = FlowRouter.getParam('id'),
			query = g.Results.findOne({studentId: id}),
			currentClass = g.Students.findOne({studentId: id}),
			requestedResult = Session.get('requestedResult'),
			gTerm = g.Settings.findOne({_id: "default"}).term;
		if(query.result){
			let filtered = query.result.filter(function(r){
					if(requestedResult && (requestedResult.class && requestedResult.term) && requestedResult.id === id){
						if(r.class === requestedResult.class && r.term == requestedResult.term){
							return r;
						}	
					}
					else if(r.class === currentClass.currentClass && r.term == gTerm){
						return r;
					}
			});
			return filtered[0];
		}return;
	},

	studentInfo: function(){
		let id = FlowRouter.getParam('id');
		return g.Students.findOne({studentId: id}, {firstName: 1, 
													lastName: 1,
													otherName: 1,
													email: 1,
													studentId: 1,
													currentClass: 1,
													});
	},
	availableClass: function(){
		let id = FlowRouter.getParam('id');
		let classes = [];
		let data = g.Results.findOne({studentId: id},{result: 1});
		
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

Template.singleResult.events({
	'submit form': function(e){
		e.preventDefault();
		let requestedClass = e.target.class.value;
		let requestTerm = e.target.term.value;
		let request = {id: this.studentId, class: requestedClass, term: requestTerm};
		Session.set('requestedResult', request);
	},

});


// add result for student
Template.updateResult.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('setting');
		});
});

Template.updateResult.helpers({
	resultFor: function(){
		let stInfo = Session.get('st.info');
		let gTerm = g.Settings.findOne({_id:"default"}).term;
		if(!$.isEmptyObject(stInfo)){
			stInfo['term'] = gTerm;
			return stInfo;
		}
	},
});

//edit result for student
Template.editResult.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('result.list');
			self.subscribe('student.list');
			self.subscribe('setting');

		});

});

Template.editResult.helpers({
	resultToEdit: function(){
		let id = FlowRouter.getParam('id'),
			query = g.Results.findOne({studentId: id}),
			currentClass = g.Students.findOne({studentId: id}),
			requestedResult = Session.get('requestedResult'),
			gTerm = g.Settings.findOne({_id: "default"}).term;

		if(query.result){
			let filtered = query.result.filter(function(r){
					if(requestedResult && (requestedResult.class && requestedResult.term) && requestedResult.id === id){
						if(r.class === requestedResult.class && r.term == requestedResult.term){
							r['studentId'] = id; 
							return r;
						}	
					}else if(r.class === currentClass.currentClass && r.term == gTerm){
							r['studentId'] = id; 
							return r;
					}
			});
			return filtered[0];
		}return;
	},
	studentInfo: function(){
		let id = FlowRouter.getParam('id');
		return g.Students.findOne({studentId: id}, {firstName: 1, 
													lastName: 1,
													otherName: 1,
													studentId: 1,
													currentClass: 1,
													});
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
// **********************///
// **********************///
// ******BREAK Break******///
// **********************///
// **********************///

Template.paymentList.onCreated(function(){
	let self = this;
	self.autorun(function(){
		self.subscribe('lastPayment.check');
		self.subscribe('setting');

		

	});
});

Template.paymentList.helpers({
	payments: function(){
		let getFilter = Session.get('paymentFilter');
			if(getFilter && (getFilter.selectedClass || getFilter.studentId || getFilter.name)){
				return g.Payments.find({$or: [{currentClass: getFilter.selectedClass},
												{studentId: getFilter.studentId},
												{fullName: {$regex: /getFilter.name/i}}]}).fetch();
			}
		return g.Payments.find({currentClass: "JSS1"});
	},
});



Template.paymentList.events({
	"click .addPayment": function(){

			let query = {name: (this.lastName || " ") +", "+(this.firstName || " ") +" "+ (this.otherName || " "), 
						studentId: this.studentId || undefined,
						currentClass: this.currentClass || undefined,
						target: this.meteorIdInStudent || undefined,
					};
			Session.set('st.info', query);

	},

	'submit form': function(e){
			e.preventDefault();
			let name = e.target.name.value;
			let studentId = e.target.studentId.value;
			let selectedClass = e.target.class.value;
			let filter = {name: name,
						studentId: studentId,
						selectedClass: selectedClass};
			Session.set('paymentFilter', filter);

	},

});


Template.singlePayment.onCreated(function(){
	let self = this;
	self.autorun(function(){
		self.subscribe('payment.list');
		self.subscribe('student.list');
		self.subscribe('setting');
		
	});
});

Template.singlePayment.helpers({
	singlePay: function(){
		let id = FlowRouter.getParam('id'),
			query = g.Payments.findOne({studentId: id}),
			currentClass = g.Students.findOne({studentId: id}),
			requestedPayment = Session.get('requestedPayment');
		let gTerm = g.Settings.findOne({_id: "default"}).term;


			let filtered = query.payment.filter(function(p){

				if(requestedPayment && (requestedPayment.class && requestedPayment.term) && requestedPayment.id == id){
					if(p.class == requestedPayment.class && p.term == requestedPayment.term){
						return p;
					}	
				}

				else if(p.class == currentClass.currentClass && p.term == gTerm){
					return p;
				}
				return false;
			});

			if(filtered[0]){return filtered[0];} return false;

	},

	studentInfo: function(){
		let id = FlowRouter.getParam('id');
		return g.Students.findOne({studentId: id}, {firstName: 1, 
													lastName: 1,
													otherName: 1,
													email: 1,
													studentId: 1,
													currentClass: 1,
													});
	},

	availableClass: function(){
		let id = FlowRouter.getParam('id');
		let classes = [];
		let data = g.Payments.findOne({studentId: id},{payment: 1});
			data.payment.forEach(function(pay){
				classes.push(pay.class);
			});

			if(classes.length){
				classes = classes.filter(function(item, pos){
					return classes.indexOf(item) == pos;
				});

				return classes;	
			}
			

			return false;
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

Template.singlePayment.events({
	'submit form': function(e){
		e.preventDefault();
		let requestedClass = e.target.class.value;
		let requestTerm = e.target.term.value;
		let request = {id: this.studentId, class: requestedClass, term: requestTerm};
		Session.set('requestedPayment', request);
	},

});

Template.updatePayment.onCreated(function(){
	let self =  this;
		self.autorun(function(){
			self.subscribe('setting');
		});
});

Template.updatePayment.helpers({
	paymentFor: function(){
		let stInfo = Session.get('st.info');
		let gTerm = g.Settings.findOne({_id: "default"}).term;
		if(!$.isEmptyObject(stInfo)){
			stInfo['term'] = gTerm;
			return stInfo;
		}
		return;
	},

	paymentInfo: function(){
		let stInfo = Session.get('st.info');
	},
	paymentCategory: function(){
		let category = [],
			id = g.Settings.findOne({_id: 'default'}).settingId,
			session = g.Settings.findOne({_id: 'default'}).session,
			term = g.Settings.findOne({_id: 'default'}).term;
		let query = g.Settings.findOne({_id: id, session: session}, {term: 1});
			
			query.term.forEach(function(obj){
				for(let key in obj){
					if(typeof obj[key] == "object"){
						category.push(key);
					}
				}
			});
			if(category.length){
				category = category.filter(function(item, pos){
					return category.indexOf(item) == pos;
				});
				return category;
			}	
	},
	defaultPayment: function(){
		let stInfo = Session.get('st.info');
			
		let	paymentClass = stInfo['currentClass'],
			paymentCategory = stInfo['paymentCategory'],

			id = g.Settings.findOne({_id: 'default'}).settingId,
			session = g.Settings.findOne({_id: 'default'}).session,
			term = g.Settings.findOne({_id: 'default'}).term;

		let query = g.Settings.find({_id: id, session: session});
		let	amount = query.term.filter(function(doc){
						if(doc['currentTerm'] == term && doc[paymentCategory]['currentTerm'] == term){
							return doc;
						}
					});
		let fees = amount[0][paymentCategory][paymentClass];
		
		return {term: term, paymentCategory: paymentCategory}; 
			
	},

});

Template.updatePayment.events({
	"submit form": function(e){
		e.preventDefault();
		let paymentCat = e.target.paymentCat.value;
		let stInfo = Session.get('st.info');
			stInfo['paymentCategory'] = paymentCat;
			Session.set('st.info', stInfo);
	}

});

//Assignment Template
Template.assignmentList.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('setting');
			self.subscribe('assignment.list');
		});
});

Template.assignmentList.helpers({
	assignments: function(){
		let filter = Session.get("assignmentFilter"),
			assList;

			if(filter && (filter.class || filter.subject)){
				assList = g.Assignments.find({$or: [{class: filter.class}, {subject: filter.subject}]}).fetch().reverse();
			}else{			
				assList = g.Assignments.find({"class": "JSS1"}).fetch().reverse();
			}

			assList.forEach(function(doc){
				let	date = new Date();
				doc.validity = doc.endDate < date;

				let	sDate = doc.startDate,
					eDate = doc.endDate;
					doc.startDate = sDate.getDate() + "-" + monthArr[sDate.getMonth()] + "-" + sDate.getFullYear();
					doc.endDate = eDate.getDate() + "-" + monthArr[eDate.getMonth()] + "-" + eDate.getFullYear();
					doc.answerCount = doc.answer?doc.answer.length:"0";
					return doc;
			});
		return assList;
	},	

});

Template.assignmentList.events({
	"submit form": function(e){
		e.preventDefault();
		let requestedClass = e.target.class.value,
			requestedSubject = e.target.subject.value;
		let obj = {class: requestedClass, subject: requestedSubject};
			Session.set('assignmentFilter', obj);
	}

});


Template.singleAssignment.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('setting');
			self.subscribe('assignment.list');
			self.subscribe('staff.name');
			self.subscribe('student.list');
		});
});

Template.singleAssignment.helpers({
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
				thisAssignment.staffId = staff.staffId;
			}
			thisAssignment.canEdit = thisAssignment.addedBy == Meteor.userId();

		return thisAssignment;
	},
	answerCount: function(){
		let id = FlowRouter.getParam('id'),
			query = g.Assignments.findOne({_id: id});
			if(query.answer){
				return query.answer.length;
			}
			return 0;
	},
	answerList: function(){
		let id = FlowRouter.getParam('id'),
			query = g.Assignments.findOne({_id: id});

			if(query.answer){
				let answers = query.answer.map(function(answer){
					let q = g.Students.findOne({meteorIdInStudent: answer.id});
					let name = (q.firstName || " ") +" "+ (q.lastName || " ") +" "+ (q.otherName || " ");
						answer.fullName = name;
						return answer;
				});
				return answers;
				}
	},

});

Template.singleAssignment.events({
	"submit form": function(e){
		e.preventDefault();
		let score = e.target.score.value;
		let comment = e.target.comment.value;
		let id = e.target.id.value;
		this.score = score;
		this.comment = comment;
		Meteor.call("scoreAssignment", id, this, function(error){
			if(error){
				insertNotice(error, 5000);
			}else{
				insertNotice("Score was awarded okay.", 4000);
			}
		});
		
	}

});

Template.editAssignment.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('setting');
			self.subscribe('assignment.list');

		});
});

Template.editAssignment.helpers({
	assignmentToEdit: function(){
		let id = FlowRouter.getParam('id'),
			thisAssignment = g.Assignments.findOne({_id: id});
		return thisAssignment;
	}
});
Template.createMessage.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('staff.name');
		});
});

Template.createMessage.helpers({
	staff: function(){
		return g.Staffs.find({});
	},

});

Template.createMessage.events({
	'submit form': function(e){
		e.preventDefault();
		let msgStaff = $('select.msgStaff option:selected').map(function(){ return this.value;}).get(),
			msgClass = [],
			msgTitle = e.target.title.value,
			msgBody = e.target.body.value;
			
			$('#msgClass input:checked').map(function(){
				msgClass.push($(this).attr('value'));
			});
		if(msgStaff.length && msgClass.length){
			insertNotice('Cannot send the same message to staff and student at the same time.', 5000);
			return false;
		}
		let msgObj = {to: msgStaff.concat(msgClass), subject: msgTitle, content: msgBody};
		console.log(msgObj);
		Meteor.call('createMessage', msgObj, function(error){
			if(error){
				insertNotice(error, 5000);
			}else{
				insertNotice('Your message was sent successfully', 4000);
					FlowRouter.go('/message');
			}
		});
	},
});

Template.messageList.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('message.list');
			self.subscribe('staff.name');
			self.subscribe('student.list');
		});
});

Template.messageList.helpers({
	
});

//Autoform hooks and addHooks
AutoForm.hooks({
	// Insert Student
	insertStudent:{
		onSubmit: function(data){
			this.event.preventDefault();
			Session.set('passportTarget',{id:data.studentId, name:data.lastName +' '+data.firstName, diff: 'student'});
			Meteor.call('createStudent', data, function(error){
				if(error){
					insertNotice(error, 5000);
				}else{
					insertNotice('Student successfully created!', 4000);
						FlowRouter.go('/passportUploader');
				}
			});
		}
	},
// Insert Staff form
	insertStaff:{
		onSubmit: function(data){
			this.event.preventDefault();
			Session.set('passportTarget', {id:data.staffId, name:data.lastName +' '+data.firstName, diff: 'staff'});
			Meteor.call('createStaff', data, function(error){
				if(error){
					insertNotice(error, 5000);
				}else{
					insertNotice('Staff successfully created!', 4000);
						FlowRouter.go('/passportUploader');
				}
			});
			
		}
	},

//insert Result 
	updateResult:{
		onSubmit: function(data){
			this.event.preventDefault();
				let get = Session.get('st.info');
					if(!$.isEmptyObject(data) && get){
							Meteor.call('updateResult',get, data, function(error){
							if(error && (error.error == 301 || error.error == 302 || error.error == 502 || error.error == 500)){
								
								insertNotice((error.reason + ", " + error.details), 5000);
							}
							else{	
									insertNotice('Result successfully added!', 3000);
									let pathToGo = FlowRouter.path('/result/view/' + get.studentId);
									FlowRouter.go(pathToGo);
							}
						});
					}else{
						
						insertNotice('error occurred!. Invalid data', 5000);
						return false;
					}
		}
	},
	editStaff:{
		onSubmit: function(doc){
			this.event.preventDefault();
			let id = this.currentDoc.staffId;
			Meteor.call("editStaff", this.currentDoc, doc, function(error){
				if(error){
					insertNotice("Error: "+ error, 4000);
				}else{
					insertNotice('Staff employment data updated successfully', 3000);
					let pathToGo = FlowRouter.path('/staff/view/' + id);
						FlowRouter.go(pathToGo);
				}
			});
		},
	},
	updateStaff:{
		onSubmit: function(doc){
			this.event.preventDefault();
			let id = this.currentDoc.staffId;
			Meteor.call("updateStaff", this.currentDoc, doc, function(error){
				if(error){
					insertNotice("Error: "+ error, 4000);
				}else{
					insertNotice('Staff profile updated successfully', 3000);
					let pathToGo = FlowRouter.path('/staff/view/' + id);
						FlowRouter.go(pathToGo);
				}
			});
		},
	},

	editStudent:{
		onSubmit: function(doc){
			this.event.preventDefault();
			let id = this.currentDoc.studentId;
			Meteor.call("editStudent", this.currentDoc, doc, function(error){
				if(error){
					insertNotice("Error: "+ error, 4000);
				}else{
					insertNotice('Student admission data updated successfully', 3000);
					let pathToGo = FlowRouter.path('/student/view/' + id);
						FlowRouter.go(pathToGo);
				}
			});
		},
	
	},

	updateStudent:{
		onSubmit: function(doc){
			this.event.preventDefault();
			let id = this.currentDoc.studentId;
			Meteor.call("updateStudent", this.currentDoc, doc, function(error){
				if(error){
					insertNotice("Error: "+ error, 4000);
				}else{
					insertNotice('Student profile updated successfully', 3000);
					let pathToGo = FlowRouter.path('/student/view/' + id);
						FlowRouter.go(pathToGo);
				}
			});
		},
	},

	editResult:{
		onSubmit: function(data){
			this.event.preventDefault();
				if(!$.isEmptyObject(data) && this.currentDoc){
					Meteor.call('editResult', this.currentDoc, data, function(error, resultId){
						if(error){
							insertNotice((error.reason + ", " + error.details), 5000);
						}else{
							insertNotice('Result successfully updated', 5000);
							let pathToGo = FlowRouter.path('/result/view/' + resultId);
								FlowRouter.go(pathToGo);
						}
					});
				}else{
					insertNotice('error occurred!. Invalid data');				
					window.location.reload();	
					return false;
				}

		},
	},
	newSession: {
		onSubmit: function(doc){
			this.event.preventDefault();
			Meteor.call("newSession", doc, function(error){
				if(error){
					insertNotice(error, 5000);
				}else{
					insertNotice('New term was created successfully');
				}
				Modal.hide('newSessionModal');
			});
		},
	},
	setTermAndSchoolFees: {
		onSubmit: function(fees){
			this.event.preventDefault();
			Meteor.call("setTermAndSchoolFees", fees, undefined, undefined, function(error){
				if(error){
					insertNotice(error, 5000);
				}else{
					insertNotice('New term was created successfully');
				}

				Modal.hide('setTermAndSchoolFees');
			});
		},
	},
	updateSchoolFees: {
		onSubmit: function(fees){
			this.event.preventDefault();
			Meteor.call("updateSchoolFees", fees, function(error){
				if(error){
					insertNotice(error);
				}else{
					insertNotice("school fees updated successfully");
				}
			});
		}
	},
	//Assignment
	createAssignment:{
		onSubmit: function(doc){
			this.event.preventDefault();
			Meteor.call("createAssignment", doc, function(error, result){
				if(error){
					insertNotice("Error occurred", 5000);
				}else{				
					insertNotice("Assignment was created okay", 3000);
					let pathToGo = FlowRouter.path("/assignment/view/" + result);
						FlowRouter.go(pathToGo);}
			});
		}
	},
	editAssignment: {
		onSubmit: function(doc){
			this.event.preventDefault();
			let id = this.currentDoc._id;
			Meteor.call('editAssignment', this.currentDoc._id, doc, function(error){
				if(error){
					insertNotice("Error "+ error);
				}else{
					insertNotice("Assignment updated", 4000);
					let pathToGo = FlowRouter.path("/assignment/view/" + id);
						FlowRouter.go(pathToGo);}
			});
		}
	}
});

AutoForm.debug();
// **********************///
// **********************///
// ******BREAK Break******//
// **********************///
// **********************///




//Grade Calculator
function calculateGrade(num){
	if(num >= 70) return "A";
	else if(num >= 60) return "B";
	else if(num >= 50) return "C";
	else if(num >= 45) return "D";
	else if(num >= 40) return "E";
	else return "F";

}

//Remark calculator
function remark(grade){
	switch (grade) {
		case 'A':
		case 'A1':
			return "Excellent";
			break;
		case 'B':
		case 'B2':
		case 'B3':
		case 'C':
		case 'C4':
		case 'C5':
		case 'C6':
			return "Credit";
			break;
		case 'D':
		case 'D7':
		case 'E':
		case 'E8':
			return "Pass";
			break;
		case 'F':
			return "Fail";
			break;
		default:
			return "Not Offered";
			break;
	}
}

function insertNotice(text, time = 4000){
	$('.insertNotice').text(text);
	$('.insertNotice').show('slow');
	bootbox.alert(text)
	setTimeout(function(){
		$('.insertNotice').fadeOut(3000);
			}, time);
}

function isEmptyObject(obj){
	for(var key in obj){
		if(Object.prototype.hasOwnProperty.call(obj, key)){
			return false;
		}
	}
	return true;
}

function sentenceCase(name){
	if(typeof(name) === "string"){
		var cased = [];
		name.split(" ").forEach(function(n){
			cased.push(n[0].toUpperCase() + n.substring(1).toLowerCase()); 
		});

		return cased.join(" ");
	}
	return name;
}