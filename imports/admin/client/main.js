import './main.html';
//grab setting
Template.staffDashboard.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("student.list");
			self.subscribe("result.list");
			self.subscribe("payment.list");
			self.subscribe("staff.list");
			self.subscribe("log.list");
		});
});
Template.staffDashboard.helpers({
	//Students count
	studentCount:function(currentClass){
		return g.Students.find({"currentClass":currentClass}).count();
	},
	allStudent:function(){
		return g.Students.find().count();
	},
	graduates:function(){
		return g.Graduates.find().count()
	},
	//results count
	resultCount:function(currentClass){
		let s = g.setting();if(!s)return;//review
		return g.Results.find({"currentClass":currentClass,"result.session":s.session,"result.term":s.term}).count();
	},
	allResult:function(){
		let s = g.setting();if(!s)return;//review
		return g.Results.find({"result.session":s.session,"result.term":s.term}).count();
	},
	//payments count
	paymentCount:function(currentClass){
		let s = g.setting();if(!s)return;//review
		return g.Payments.find({"currentClass":currentClass,"payment.session":s.session,"payment.term":s.term}).count();
	},
	allPayment:function(){
		let s = g.setting();if(!s)return;//review
		return g.Payments.find({"payment.session":s.session,"payment.term":s.term}).count();
	},
	termSchoolFees: function(){
		let s = g.setting();if(!s)return;//rreview
		let session = s.session,
			term = s.term,
			id = s.settingId;
		let query = g.Settings.findOne({"_id":id,"session":session});
		let filtered = query.term.filter(function(current){
				if(current.currentTerm == term && current.schoolFees.currentTerm == term){
					return current;
				}
		});
		return filtered[0]
	},
	log:function(){
		let logs = g.Logs.find({},{limit:5}).fetch();
			logs.forEach(function(log){
				let name;
				if(Meteor.userId() === log.by){
					name = "You";
				}else{
					let query = g.Staffs.findOne({"meteorIdInStaff":log.by});
					query?name = query.lastName+" "+query.firstName+" ("+query.staffId+")":name="superAdmin";	
				}
				log.name = name;
				return log;
			});
		return logs;
	}
});

Template.staffDashboard.events({
	"submit form":function(e){
		e.preventDefault();
		let notification = e.target.notification.value;
		g.meteorCall("pushNotification",{
			doc:notification,
			successMsg:"Notification was updated."
			});
		$("div.notification form").hide("fast");
		$("div.notification article").show("fast");
	},
	"click button.pushNew":function(e){
		e.preventDefault();
		$("div.notification article").hide("fast");
		$("div.notification form").show("fast");

	},
	"click button.cancelPush":function(e){
		$("div.notification article").show("fast");
		$("div.notification form").hide("fast");

	}
});
Template.ctrlpanel.helpers({
	termSchoolFees: function(){
		let s = g.setting();if(!s)return;//needs review
		let session = s.session,
			term = s.term,
			id = s.settingId;
		let query = g.Settings.findOne({"_id":id,"session":session});
		let filtered = query.term.filter(function(current){
				if(current.currentTerm == term && current.schoolFees.currentTerm == term){
					return current;
				}
		});
		return filtered[0]
	},
});
Template.ctrlpanel.events({
	'click #ctrlpanel button#promoteStudents': function(){
		let warning = '<h4>You\'re about to promote all students in the school. This cannot be undone! <br/> Are you sure?</h4>';
			bootbox.confirm(warning,function(verify){
				if(verify){
					g.meteorCall("promoteStudents",{
						successMsg:"All students were promoted with success."
					});
				}
			});
			
	},

	'click #newSessionBtn': function(){
		Modal.show('newSessionModal', function(){return;}, {backdrop: 'static', keyboard: false});
	},

	'click #newTermBtn': function(){
		Modal.show('setTermAndSchoolFees', function(){return;}, {backdrop: 'static', keyboard: false});
	},
	'click .schoolFees button':function(e){
		e.preventDefault();
		$('.schoolFees').hide("fast");
		$('.changeSchoolFees').show("fast");
	}

});


//list of admin among staffs
Template.editorList.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('staff.list');
			self.subscribe('editor.list');
		});
});

Template.editorList.helpers({
	editors: function(){

	}
})
//List of Staff in School
Template.staffList.onCreated(function(){
	let self = this;
	self.autorun(function(){
		self.subscribe('staff.list');
	});
});

Template.staffList.helpers({
	staffs: function(){
		let filter = Session.get('staffFilter'),
			staffs = g.Staffs.find({});
			if(!filter || filter=="all_staff"){
				return staffs;
			}else if(filter.name || filter.staffId){
					filter.name?filter.name=g.sentenceCase(filter.name):"";
					staffs = g.Staffs.find({
							$or: [{staffId: filter.staffId},
								{firstName:filter.name},
								{lastName:filter.name},
								{otherName:filter.name}]}).fetch();
				return staffs;
			}
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
	'click button#all_staff':function(e){
		e.preventDefault();
		Session.set('staffFilter', "all_staff");
	}
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
Template.singleStaff.events({
	'click #makeAdmin':function(e){
		e.preventDefault();
		let staff = this.staffId, staffId = this.meteorIdInStaff;
		bootbox.confirm("Are you sure to make "+this.lastName+" "+this.firstName+" ("+staff+") admin?", function(result){
			if(result){
				let obj = {staffId:staffId,staff:staff,action:'add'};
				g.meteorCall("toggleAdmin",{doc:obj,
					successMsg:staff+" is now an admin."});
			}
		});
	},
	'click #removeAdmin':function(e){
		e.preventDefault();
		let staff = this.staffId, staffId = this.meteorIdInStaff;
		bootbox.confirm("Are you sure to remove "+this.lastName+" "+this.firstName+" ("+staff+") as admin?", function(result){
			if(result){
				let obj = {staffId:staffId,staff:staff,action:'remove'};
				g.meteorCall("toggleAdmin",{doc:obj,
					successMsg:staff+" is no more an admin."});
			}
		});
	},
	"click #deleteStaff":function(e){
		e.preventDefault();
		let self = this;
			self.type="staff";
		let warning = "<h4>Deleting a staff will completely remove him/her from the database.<br/>";
			warning += "This cannot be undone. Are you sure to continue?</h4>";
		bootbox.confirm(warning,function(result){
			if(result){
				g.meteorCall("removeUser",{
					doc:self,
					successMsg:"The staff was removed!",
					redirect:"staffList"
				});
			}
		});
	}
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
					g.notice(error, 8000);
					return false;
				}
			//read the file if valid
			let maxHeight = 310, maxWidth = 250;
			let reader = new FileReader();
				reader.onload = function(e){
					let image = document.createElement('img');
						image.onload = function(){
								if((image.width || image.naturalWidth) > maxWidth){
									g.notice('Image width cannot be greater than ' + maxWidth, 6000);
									$('#uploadBtn').hide('slow');
									$('#passportPreview').html("<strong>Invalid passport <br/> width &gt; </strong>"+maxWidth);
									return false;
								}else if((image.height || image.naturalHeight) > maxHeight){
									g.notice('Image height cannot be greater than ' + maxHeight);
									$('#uploadBtn').hide('slow');
									$('#passportPreview').html("<strong>Invalid passport <br/> height &lt; </strong> "+maxHeight);
									return false;
								}
								$('#passportPreview').html(image);
								$('#uploadBtn').fadeIn('slow');
						}
						image.onerror = function(){
							$('#file').hide('fast');
							$('#passportPreview').html("You selected a file renamed to an image extension. <br/>Do you know what you're doing?");
							return false;
						}		
						image.src = e.target.result;
				}
				reader.readAsDataURL(file);
	},
	'click button#uploadBtn': function(){
			let preview = $('#passportPreview img').attr('src');
				if(preview.length < 100){
					g.notice("You've not selected any file to upload");
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
							g.notice("error occurred: "+err);
							return;
						}
					else{
						let pathToGo = target.diff;
						if(pathToGo == 'student'){
							g.notice("Passport uploaded successfully", 4000);
							next = FlowRouter.path('/dashboard/student/view/'+target.id);
									FlowRouter.go(next);
						}else if(pathToGo == 'staff'){
							g.notice("Passport uploaded successfully", 4000);
							next = FlowRouter.path('/dashboard/staff/view/'+target.id);
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
//List of student in School
Template.studentList.onCreated(function(){
	let self = this;
	self.autorun(function(){
		self.subscribe('student.list');

	});
});
Template.studentList.helpers({
	students: function(){
		let filter = Session.get('studentFilter');
			if(filter && (filter.selectedClass || filter.studentId || filter.name)){
				filter.name?filter.name=g.sentenceCase(filter.name):"";
				return g.Students.find({$or: [{currentClass: filter.selectedClass},
										{studentId: filter.studentId},
										{firstName:filter.name},
										{lastName:filter.name},
										{otherName:filter.name}	
										]}).fetch();
			}
		return g.Students.find({currentClass: "JSS1"}).fetch();
	},
	studentFilter:function(){
		let filter = Session.get('studentFilter');
		return filter;
	}
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
	});
});
Template.singleStudent.helpers({
	student: function(){
		let id = FlowRouter.getParam('id');
		let data = g.Students.findOne({studentId: id});
		return data;
	},
});
Template.singleStudent.events({
	"click #deleteStudent":function(e){
		e.preventDefault();
		let self = this;
			self.type="student";
		let warning = "<h4>Deleting a student will remove the results and payments.<br/>";
			warning += "This cannot be undone. Are you sure to continue?</h4>";
		bootbox.confirm(warning,function(result){
			if(result){
				g.meteorCall("removeUser",{
					doc:self,
					successMsg:"The student was removed!",
					redirect:"studentList"
				});
			}
		});
	}
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
		return g.Students.findOne({"studentId": id});
	}
});
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
Template.resultList.onCreated(function(){
	let self = this;
	self.autorun(function(){
		self.subscribe('result.list');
	});
});
Template.resultList.helpers({
	results: function(){
		let s = g.setting();
		if(!s)return;//review
		let filter = Session.get('resultFilter'),result,filtered;
			if(filter && (filter.selectedClass || filter.studentId)){
				result = g.Results.find({
					"graduated":{$ne:true},
					$or: [{"currentClass":filter.selectedClass},
						{"studentId":filter.studentId}]}).fetch();
			}else{
				result = g.Results.find({"graduated":{$ne:true},currentClass:"JSS1"}).fetch();
			}
		if(result){
			filtered = result.map(function(res){
			//alterntive:filter function for skipping empty result
				if(res.result){
					//get last result
					lastResult = res.result[res.result.length-1];
					//last result equals this term result?
					if(lastResult.class==res.currentClass && lastResult.session == s.session && lastResult.term == s.term){
						res.termResultAvailable=true;
					}
					res.lastResult = lastResult; 
					//return res; //only available result would be returned
				}
				//return all result
				return res;
			});
			return filtered;
		}	
	},
	resultFilter:function(){
		let filter = Session.get('resultFilter');
		return filter;
	}
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
			let studentId = e.target.studentId.value;
			let selectedClass = e.target.class.value;
			let filter = {studentId: studentId,
						selectedClass: selectedClass};
			Session.set('resultFilter', filter);
	},
});
Template.singleResult.onCreated(function(){
	let self = this;
	self.autorun(function(){
		self.subscribe('result.list');
		self.subscribe('student.list');
		self.subscribe('graduate.list');
	});
});

Template.singleResult.helpers({
	singleRes: function(){
		let id = FlowRouter.getParam('id'),
			s = g.setting();if(!s)return;//review
		let	query = g.Results.findOne({"studentId": id});
		//get this student current class in student list 
		//or graduated student list
		let	currentClass = query.currentClass,		
		//get searched result if available
			requestedResult = Session.get('requestedResult');
		if(query.result){
			let filtered = query.result.filter(function(r){
					if(requestedResult && (requestedResult.class && requestedResult.term) && requestedResult.id === id){
						if(r.class === requestedResult.class && r.term==requestedResult.term){
							return r;
						}	
					}//if no session, return result for current class
					else if(currentClass && (r.class===currentClass && r.term===s.term)){
						return r;
					}//else if graduated student, return SSS3 result with current term
					else if(r.class === "SSS3" && r.term == s.term){
						return r;
					}
			});
			if(filtered[0])return filtered[0];
		}return;
	},
	studentInfo: function(){
		let id = FlowRouter.getParam('id');
		let info = g.Students.findOne({studentId: id}, {"firstName": 1, 
													"lastName": 1,
													"otherName": 1,
													"email": 1,
													"studentId": 1,
													"currentClass": 1,
													});
		//is student still in school?
		if(info){
			return info;
		}else{//otherwise check graduate list for student info
			return g.Graduates.findOne({"studentId": id}, {"firstName": 1, 
													"lastName": 1,
													"otherName": 1,
													"email": 1,
													"studentId": 1,
													"currentClass": 1,
													});
		}
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
	}
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
Template.updateResult.helpers({
	resultFor: function(){
		let stInfo = Session.get('st.info'),
			s = g.setting();if(!s)return;//review
		if(!$.isEmptyObject(stInfo)){
			stInfo['term'] = s.term;
			return stInfo;
		}
	}
});
//edit result for student
Template.editResult.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('result.list');
			self.subscribe('student.list');
		});
});
Template.editResult.helpers({
	resultToEdit: function(){
		let id = FlowRouter.getParam('id'),
			s = g.setting();if(!s)return;//review
		let	query = g.Results.findOne({studentId: id}),
			currentClass = g.Students.findOne({studentId: id}),
			requestedResult = Session.get('requestedResult');
		if(query.result){
			let filtered = query.result.filter(function(r){
					if(requestedResult && (requestedResult.class && requestedResult.term) && requestedResult.id === id){
						if(r.class === requestedResult.class && r.term == requestedResult.term){
							r['studentId'] = id; 
							return r;
						}	
					}else if(r.class === currentClass.currentClass && r.term == s.term){
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
	}
});
Template.paymentList.onCreated(function(){
	let self = this;
	self.autorun(function(){
		self.subscribe('payment.list');
	});
});
Template.paymentList.helpers({
	payments:function(){
		let s = g.setting();if(!s)return;//review
		let filter = Session.get('paymentFilter'),payment,filtered;
			if(filter && (filter.selectedClass || filter.studentId)){
				payment = g.Payments.find({
					"graduated":{$ne:true},
					$or: [{currentClass: filter.selectedClass},
						{studentId: filter.studentId}]}).fetch();
			}else{
				payment = g.Payments.find({"graduated":{$ne:true},currentClass:"JSS1"}).fetch();
			}
		if(payment){
			filtered = payment.map(function(pay){
				if(pay.payment){
					lastPayment = pay.payment[pay.payment.length-1];
					if(lastPayment.class==pay.currentClass && lastPayment.session == s.session && lastPayment.term == s.term){
						pay.termPaymentAvailable=true;
					}
					pay.lastPayment = lastPayment; 
				}
				return pay;
			});
			return filtered;
		}
	},
	paymentFilter:function(){
		let filter = Session.get('paymentFilter');
		return filter;	
	}
});
Template.paymentList.events({
	"click .addPayment":function(){
			let query = {name:(this.lastName || " ") +", "+(this.firstName || " ") +" "+ (this.otherName || " "), 
						studentId:this.studentId || undefined,
						currentClass:this.currentClass || undefined,
						target:this.meteorIdInStudent || undefined,
					};
			Session.set('st.info',query);
	},
	'submit form':function(e){
			e.preventDefault();
			let studentId = e.target.studentId.value;
			let selectedClass = e.target.class.value;
			let filter = {studentId: studentId,
						selectedClass: selectedClass};
			Session.set('paymentFilter', filter);
	}
});
Template.singlePayment.onCreated(function(){
	let self = this;
	self.autorun(function(){
		self.subscribe('payment.list');
		self.subscribe('student.list');
		self.subscribe('staff.name');
		self.subscribe('graduate.list');
	});
});
Template.singlePayment.helpers({
	singlePay: function(){
		let s = g.setting();if(!s)return;//review
		let id = FlowRouter.getParam('id'),
			query = g.Payments.findOne({"studentId":id}),
			currentClass = query.currentClass,
			requestedPayment = Session.get('requestedPayment');
			let filtered;
			if(query.payment){
				filtered = query.payment.filter(function(p){
					if(requestedPayment && (requestedPayment.class && requestedPayment.term) && requestedPayment.id == id){
						if(p.class == requestedPayment.class && p.term == requestedPayment.term){
							return p;
						}	
					}
					else if(currentClass && (p.class == currentClass && p.term == s.term)){
						return p;
					}else if(p.class === "SSS3" && p.term == s.term){
						return p;
					}
					return;
				});
			
				if(filtered[0]){
					let staff = g.Staffs.findOne({"meteorIdInStaff":filtered[0].addedBy});
						staff?filtered[0].staffName=staff.lastName+" "+staff.firstName:filtered[0].staffName="Super Admin";
					return filtered[0];
				}
			}
			
	},
	studentInfo: function(){
		let id = FlowRouter.getParam('id');
		let info = g.Students.findOne({"studentId": id}, {"firstName": 1, 
													"lastName": 1,
													"otherName": 1,
													"email": 1,
													"studentId": 1,
													"currentClass": 1,
													});
		if(info){
			return info;
		}else{
			return	g.Graduates.findOne({"studentId": id}, {"firstName": 1, 
													"lastName": 1,
													"otherName": 1,
													"email": 1,
													"studentId": 1,
													"currentClass": 1,
													});
		}//end if
	},
	availableClass: function(){
		let id = FlowRouter.getParam('id');
		let classes = [];
		let data = g.Payments.findOne({"studentId": id});
			if(data.payment){
				data.payment.forEach(function(pay){
					classes.push(pay.class);
				});
			}
			if(classes.length){
				classes = classes.filter(function(item, pos){
					return classes.indexOf(item) == pos;
				});
				return classes;	
			}
			return;
	},
});
Template.singlePayment.events({
	'submit form': function(e){
		e.preventDefault();
		let requestedClass = e.target.class.value;
		let requestTerm = e.target.term.value;
		let request = {id:this.studentId,class:requestedClass,term:requestTerm};
		Session.set('requestedPayment',request);
	},
});
Template.updatePayment.helpers({
	paymentFor:function(){
		let s = g.setting();if(!s)return;//review
		let	id = s.settingId,session = s.session,term = s.term,
			stInfo = Session.get('st.info');//get session.
			stInfo.term = term //current term
		//get this term payments
		let query = g.Settings.findOne({"_id":id,"session":session}).term;
		stInfo.fees = query[query.length-1]; //attach current term school fees to session
		stInfo.transactionId = stInfo.studentId+(new Date().toString().split(" ").join("").substring(0,20));
		// update the session
		Session.set('st.info',stInfo);
		//get all payments category
		let	category = query.map(function(obj){
				for(let key in obj){
					if(typeof obj[key] == "object"){
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
		return {"category":category,"stInfo":stInfo};	
	},
	paymentMethod:function(method){
		let ret;
		method=="Online"?ret=true:ret=false;
		return ret;
	}
});

Template.updatePayment.events({
	"submit form":function(e){
		e.preventDefault();
		let paymentCat = e.target.paymentCat.value,
			method = e.target.paymentMethod.value,
			stInfo = Session.get('st.info');
			stInfo['paymentCategory'] = paymentCat;
			stInfo['method'] = method;
			stInfo['amount'] = stInfo.fees[paymentCat][stInfo.currentClass];
			Session.set('st.info',stInfo);
			$("button#proceedPayment").attr("disabled",false);
	},
	"click button#proceedPayment":function(e){
		e.preventDefault();
		let stInfo = Session.get('st.info'),warning;
			if(stInfo.method==="Cash"){
				warning = "<h4>Confirm that you've collected ";
				warning += stInfo.amount+" for "+g.termSuffix(stInfo.term)+" term ";
				warning += stInfo.paymentCategory+" from "+stInfo.name+" (";
				warning += stInfo.studentId+") in "+stInfo.currentClass+"<br/><br/>";
				warning += "This cannot be undone. Click okay to confirm</h4>";
				bootbox.confirm(warning,function(result){
					if(result){
						g.meteorCall("updatePaymentByCash",{
							doc:stInfo,
							successMsg:"Payment was successfully"
						});
					}
				});
			}else if(stInfo.method==="Online"){
				warning = "<h4>You'll be taken to Interswitch payment gateway.</h4>";
				bootbox.confirm(warning,function(result){

				});
			}else{
				bootbox.alert("<h4>Select payment method, category and create receipt before proceed.</h4>");
				return;
			}
	}
});

//Assignment Template
Template.assignmentList.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('assignment.list');
		});
});
Template.assignmentList.helpers({
	assignments: function(){
		let filter = Session.get("assignmentFilter"),assList,
			s = g.setting();if(!s)return;//needs review
			if(filter && (filter.class || filter.subject)){
				assList = g.Assignments.find({"session":filter.session,"term":filter.term,$or:[{"class":filter.class},{"subject":filter.subject}]}).fetch().reverse();
			}else{			
				assList = g.Assignments.find({"class":"JSS1","session":s.session,"term":s.term}).fetch().reverse();
			}
			assList.forEach(function(doc){
				let	date = new Date();
				doc.validity = doc.endDate < date;
				doc.answerCount = doc.answer?doc.answer.length:"0";
				return doc;
			});
		return assList;
	},	
	assignmentFilter:function(){
		return Session.get("assignmentFilter");
	}
});

Template.assignmentList.events({
	"submit form": function(e){
		e.preventDefault();
		let requestedClass = e.target.class.value,
			requestedSubject = e.target.subject.value,
			session = e.target.session.value,
			term = Number(e.target.term.value);
		let obj = {class:requestedClass,subject:requestedSubject,session:session,term:term};
			Session.set('assignmentFilter', obj);
	}
});
Template.singleAssignment.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('assignment.list');
			self.subscribe('staff.name');
			self.subscribe('student.list');
		});
});

Template.singleAssignment.helpers({
	assignment: function(){
		let id = FlowRouter.getParam('id');
		let	thisAssignment = g.Assignments.findOne({_id: id});
		let staff = g.Staffs.findOne({meteorIdInStaff: thisAssignment.addedBy});
			if(staff){
				thisAssignment.author = (staff.firstName || '') + ', ' + (staff.lastName || '') + ' ' + (staff.otherName || '');
				thisAssignment.staffId = staff.staffId;
			}
			if(thisAssignment.answer){
				thisAssignment.answerCount = thisAssignment.answer.length;
			}
			thisAssignment.canEdit = thisAssignment.addedBy == Meteor.userId();
		return thisAssignment;
	},
	answerList: function(){
		let id = FlowRouter.getParam('id');
		let	query = g.Assignments.findOne({_id: id});
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
		this.id = e.target.id.value;
		this.score = score;
		this.comment = comment;
		g.meteorCall("scoreAssignment",{doc:this,
				successMsg:"Score was awarded."});
	}
});

Template.editAssignment.onCreated(function(){
	let self = this;
		self.autorun(function(){
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
Template.newMessage.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('staff.name');
		});
});

Template.newMessage.helpers({
	staff: function(){
		return g.Staffs.find({meteorIdInStaff: {$ne: Meteor.userId()}});
	},

});

Template.newMessage.events({
	'submit form': function(e){
		e.preventDefault();
		let msgStaff = $('select.msgStaff option:selected').map(function(){ return this.value;}).get(),
			staffName = [],
			allStaff = [],
			msgClass = [],
			msgTitle = e.target.title.value,
			msgBody = e.target.body.value;
			
			$('select.msgStaff option:selected').map(function(){
				staffName.push($(this).attr('name'));
			});

			$('#msgClass input:checked').map(function(){
				msgClass.push($(this).attr('value'));
			});
			$('#all_staff input:checked').map(function(){
				allStaff.push($(this).attr('value'));
			});
			msgStaff = msgStaff.concat(allStaff);

		if(msgStaff.length && msgClass.length){
			g.notice('Cannot send the same message to staff and student at the same time.', 8000);
			return;
		}
		let msgObj = {to: msgStaff.concat(msgClass), subject: msgTitle, content: msgBody, staffName: staffName, studentName: msgClass};
		g.meteorCall("newMessage",{doc:msgObj,
				successMsg:"Your message was sent successfully.",
				redirect:"message"});
	},
});

Template.inboxMessage.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('message.list');
		});
});

Template.inboxMessage.helpers({
	inboxMessage: function(){
		let userId = Meteor.userId(),
			inbox = g.Messages.find({$or: [{to: userId}, {to: 'all_staff'}]}).fetch().reverse();
			if(inbox){
				inbox.forEach(function(data){
					data.senderName?data.senderName = data.senderName.substr(0, 20) + '...':data.senderName = 'Unknown sender';
					data.subject = data.subject.substr(0, 75) + '...' || 'No subject';
					data.createdAt = data.createdAt.toString().substr(4, 17);
					if(data.replies){
						data.count = data.replies.length;
					}
					return data;
				});
				return inbox;
			}
	},
	inboxCount: function(){
		let userId = Meteor.userId();
		let count = g.Messages.find({$or: [{to: userId}, {to: 'all_staff'}]}).count();
		let unread = g.Messages.find({$and: [{$or: [{to:userId}, {to:'all_staff'}]}, {readStatus: false}]}).count();
		let read = g.Messages.find({$and: [{$or: [{to:userId}, {to:'all_staff'}]}, {readStatus: true}]}).count();
		return {count: count, unread: unread, read: read};


	}
});

Template.sentMessage.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('message.list');
		});
});

Template.sentMessage.helpers({
	sentMessage: function(){
		let userId = Meteor.userId(),
			sent = g.Messages.find({from: userId}).fetch().reverse();
			
				if(sent){
					sent.forEach(function(data){
						if(data.to[0] == 'all_staff'){
							data.staffName = 'All Staffs';
						}else if(data.staffName){
							data.staffName = data.staffName.join(", ").substr(0, 20);
						}else{
							data.staffName = 'Unknown Recipient';
						}
						data.subject = data.subject.substr(0, 75) + '...' || 'No Subject';
						data.createdAt = data.createdAt.toString().substr(4, 17);
	
						if(data.studentName){
							data.studentName = data.studentName.join(", ").substr(0, 20);
						}
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
		let count = g.Messages.find({from: userId}).count();
		return count;
	}

});

Template.singleMessage.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe('message.list');
		});
});

Template.singleMessage.helpers({
	message: function(){
		let id = FlowRouter.getParam('id');
		let msg = g.Messages.findOne({_id:id});
			if(msg.to[0] == 'all_staff'){
					msg.staffName = 'All Staffs';
				}else if(msg.staffName){
					msg.staffName = msg.staffName;
				}else{
					msg.staffName = 'Unknown Recipient';
				}
			msg.createdAt = msg.createdAt.toString().substr(4, 17);
		return msg;
	},
	msgReply: function(){
		let id = FlowRouter.getParam("id");
		let replies = g.Messages.findOne({_id:id}).replies;
			if(replies){
				replies.forEach(function(doc){
				doc.replyDate = doc.replyDate.toString().substr(0, 21);
				return doc;
				});
				return replies.reverse();	
			}
		return false;
	},
	count: function(){
		let id = FlowRouter.getParam("id");
		let replies = g.Messages.findOne({_id:id}).replies;
		if(replies){
			return replies.length;	
		}else{
			return 0;
		}
	},
});
Template.singleMessage.events({
	'submit form': function(e){
		e.preventDefault();
		let id = FlowRouter.getParam("id");
		let reply = e.target.reply.value;
		let doc = {id:id,reply:reply};
		g.meteorCall("replyAssignment",{doc:doc,
			successMsg:"Your reply was submitted."});
		e.target.reply.value="";
	},

});
///graduate list
Template.graduatedStudents.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("graduate.list");
		});
});
Template.graduatedStudents.helpers({
	graduates:function(){
		let grads,
			graduatesFilter = Session.get("graduatesFilter");
		//if there is a session, use it
		if(graduatesFilter){
			grads = g.Graduates.find({$or:[{
				"graduatedYear":graduatesFilter.year},
				{"studentId":graduatesFilter.studentId}]}).fetch();
			grads.count = grads.length;
			return grads;
		}//otherwise, return this year graduate.
			grads = g.Graduates.find({"graduatedYear":(new Date().getFullYear())}).fetch();
			grads.count = grads.length;
		return grads;
	}
});
Template.graduatedStudents.events({
	'submit form':function(e){
		e.preventDefault();
		let studentId = e.target.studentId.value,
			year = Number(e.target.year.value);
		Session.set("graduatesFilter",{"studentId":studentId,"year":year});
	}
});
Template.singleGraduatedStudent.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("graduate.list");
		});
});
Template.singleGraduatedStudent.helpers({
	graduate:function(){
		let id = FlowRouter.getParam("id");
		let grad = g.Graduates.findOne({"studentId":id});
		return grad;
	}
});
Template.singleGraduatedStudent.events({
	'click button#demoteGraduate':function(e){
		e.preventDefault();
		let self = this,
			warning = "<h4>Confirm to demote this student to SSS3?";
		bootbox.confirm(warning,function(result){
			if(result){
				g.meteorCall("demoteGraduate",{
					doc:self,
					successMsg:"The student was demoted to SSS3",
					redirect:"graduatedStudents"
				});
			}
		})
	}
});
//logging user actions
Template.logs.onCreated(function(){
	let self = this;
		self.autorun(function(){
			self.subscribe("log.list");
			self.subscribe("staff.list");
		});
});
Template.logs.helpers({
	log:function(){
		let logs = g.Logs.find({},{limit:50}).fetch();
			logs.forEach(function(log){
				let name;
				if(Meteor.userId() === log.by){
					name = "You";
				}else{
					let query = g.Staffs.findOne({"meteorIdInStaff":log.by});
					query?name = query.lastName+" "+query.firstName+" ("+query.staffId+")":name="Super Admin";	
				}
				log.name = name;
				return log;
			});

		return logs;
	}
});
//Autoform hooks and addHooks
AutoForm.hooks({
	//Staff profile self update
	editProfile:{
		onSubmit: function(data){
			this.event.preventDefault();
			g.meteorCall("updateStaffProfile",{doc:data,
				submitBtnId:"#editProfile",
				successMsg:"Profile updated successfully.",
				redirect:"profile"});
		}
	},
	// Insert Student
	newStudent:{
		onSubmit: function(data){
			this.event.preventDefault();
			Session.set('passportTarget',{id:data.studentId, name:data.lastName +' '+data.firstName, diff: 'student'});
			g.meteorCall("newStudent",{doc:data,
				submitBtnId:"#newStudent",
				successMsg:"Student successfully created!",
				redirect:"passportUploader"});
		}
	},
// Insert Staff form
	newStaff:{
		onSubmit: function(data){
			this.event.preventDefault();
			Session.set('passportTarget', {id:data.staffId, name:data.lastName +' '+data.firstName, diff: 'staff'});
			g.meteorCall("newStaff",{doc:data,
				submitBtnId:"#newStaff",
				successMsg:"Staff successfully created!",
				redirect:"passportUploader"});
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
								g.notice((error.reason + ", " + error.details), 8000);
								g.enableBtn("#updateResult");
								return;
							}
							else{	
								g.notice('Result successfully added!', 4000);
								let pathToGo = FlowRouter.path('/dashboard/result/view/' + get.studentId);
								FlowRouter.go(pathToGo);
							}
						});
					}else{
						g.notice('error occurred! Invalid data.', 5000);
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
					g.notice("Error: "+ error, 6000);
					g.enableBtn("#editStaff");
					return;
				}else{
					g.notice('Staff employment data updated successfully');
					let pathToGo = FlowRouter.path('/dashboard/staff/view/' + id);
						FlowRouter.go(pathToGo);
				}
			});
		},
	},
	updateStaff:{
		onSubmit: function(doc){
			this.event.preventDefault();
			let id = this.currentDoc.staffId;
			Meteor.call("editStaff", this.currentDoc, doc, function(error){
				if(error){
					g.notice("Error: "+ error, 8000);
					g.enableBtn("#updateStaff");
					return;
				}else{
					g.notice('Staff profile updated successfully');
					let pathToGo = FlowRouter.path('/dashboard/staff/view/' + id);
						FlowRouter.go(pathToGo);
				}
			});
		},
	},
	editStudent:{
		onSubmit:function(doc){
			this.event.preventDefault();
			let id = this.currentDoc.studentId;
			Meteor.call("updateStudent", this.currentDoc, doc, function(error){
				if(error){
					g.notice(error, 8000);
					g.enableBtn("#editStudent");
					return;
				}else{
					g.notice('Student admission data updated successfully');
					let pathToGo = FlowRouter.path('/dashboard/student/view/' + id);
						FlowRouter.go(pathToGo);
				}
			});
		},
	},
	updateStudent:{
		onSubmit:function(doc){
			this.event.preventDefault();
			let id = this.currentDoc.studentId;
			Meteor.call("updateStudent", this.currentDoc, doc, function(error){
				if(error){
					g.notice(error, 8000);
					g.enableBtn("#updateStudent");
					return;
				}else{
					g.notice('Student profile updated successfully');
					let pathToGo = FlowRouter.path('/dashboard/student/view/' + id);
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
							g.notice((error.reason + ", " + error.details), 8000);
							g.enableBtn("#editResult");
							return;
						}else{
							g.notice('Result successfully updated');
							let pathToGo = FlowRouter.path('/dashboard/result/view/' + resultId);
								FlowRouter.go(pathToGo);
						}
					});
				}else{
					g.notice('error occurred! Invalid data.',8000);				
					//window.location.reload();
					g.enableBtn("#editResult");	
					return;
				}

		},
	},
	newSession: {
		onSubmit: function(doc){
			this.event.preventDefault();
			g.meteorCall("newSession",{doc:doc,
				successMsg:"New session was created!"});
			Modal.hide('newSessionModal');
		},
	},
	setTermAndSchoolFees: {
		onSubmit: function(fees){
			this.event.preventDefault();
			g.meteorCall("setTermAndSchoolFees",{doc:fees,
				successMsg:"New term was created!"});
			Modal.hide('setTermAndSchoolFees');
		},
	},
	updateSchoolFees: {
		onSubmit: function(fees){
			this.event.preventDefault();
			g.meteorCall("updateSchoolFees",{doc:fees,
				submitBtnId:"#updateSchoolFees",
				successMsg:"School fees updated successfully."});
			$('.changeSchoolFees').hide("fast");
			$('.schoolFees').show("fast");
		}
	},
	//Assignment
	newAssignment:{
		onSubmit: function(doc){
			this.event.preventDefault();
			g.meteorCall("newAssignment",{doc:doc,
				submitBtnId:"#newAssignment",
				successMsg:"Assignment was created okay.",
				redirect:"assignmentList"});
		}
	},
	editAssignment: {
		onSubmit: function(doc){
			this.event.preventDefault();
			let id = this.currentDoc._id;
			doc.id = id;
			g.meteorCall("editAssignment",{doc:doc,
				submitBtnId:"#editAssignment",
				successMsg:"Assignment updated.",
				redirect:"/dashboard/assignment/view/"+id});
		}
	}
});

AutoForm.debug();