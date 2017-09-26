
Meteor.methods({
	log:function(action){
		let by = this.userId;
		let insertLog = g.Logs.insert({"action":action,"by":by,"time":(new Date())});
		return insertLog;
	},
	//staffProfile edit
	updateStaffProfile: function(data){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin','editor','staff'])){
				throw new Meteor.Error('500', 'Unauthorized Operation');
			}
		let userId = this.userId,
			staffUpdate = g.Staffs.update({meteorIdInStaff: userId}, {$set: data});
			Meteor.call("log","Updated profile");
			return staffUpdate;
		},
	//insert student by admin and editor only
	newSession: function(doc){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor'])){
				throw new Meteor.Error('500', 'Unauthorized Operation');
			}
			let gTerm = g.Settings.find({_id: "default"}).term;

			if(gTerm == 3 || gTerm == undefined){
				let session = new Date().getFullYear();
					session += (("/") + (++session)).toString();
				let countSetting = g.Settings.find({_id: {$ne: "default"}, session: session}).count();
					if(countSetting > 0){
						throw new Meteor.Error('Session duplicate', "Cannot create new session, session already exist");
					}
				let id = g.Settings.insert({"session": session});
				let insertOrUpdate	= g.Settings.update({_id: "default"}, {$set: {session: session, term: 1}}) || g.Settings.insert({_id: "default", term: 1, session: session, settingId: id});

					doc['currentTerm'] = 1;
					Meteor.call("setTermAndSchoolFees", doc, id, session);
					Meteor.call("log","Created new session");

			}else{
				throw new Meteor.Error('Session Error', 'Error occurred while creating new session.');
			}
	},
	setTermAndSchoolFees: function(doc, id, sessionYear){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor'])){
				throw new Meteor.Error('500', 'Unauthorized Operation');
			}
			let setting = g.Settings.findOne({_id: "default"});
			//check if not session or term and throw error
			if(!setting || !setting.term || !setting.session){
				throw new Meteor.Error(501, "Create new session instead!");
			}
			let term = setting.term;

				if(doc['currentTerm'] == 1 && sessionYear && id){
					 g.Settings.update({"_id": id, session: sessionYear},{$addToSet:{term:doc}});
				}else if(term == 1 || term == 2){
							switch(term){
								case 1:
									term = 2;
									break;
								case 2:
									term = 3;
									break;
								case 3:
									term = 1;
									break;
								default:
									throw new Meteor.Error("Error", "Error occurred!");
							}
						
						let id = setting.settingId;
						doc.schoolFees.currentTerm = term;
						doc.currentTerm = term;
						sessionYear = setting.session;

					let insertSchoolFees = g.Settings.update({"_id": id, "session": sessionYear}, {$addToSet: {"term": doc}});	
						if(insertSchoolFees){
							g.Settings.update({"_id": "default", "session": sessionYear}, {$set: {"term": term}});
							Meteor.call("log","Created new term");
						}
				}else{
					throw new Meteor.Error("Error occurred", "You can't create new term after third term, create new session instead");
				}
	},
	updateSchoolFees: function(data){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor'])){
				throw new Meteor.Error('500', 'Unauthorized Operation');
			}
			let setting = g.Settings.findOne({_id: "default"});
			let term = setting.term,
				id = setting.settingId,
				sessionYear = setting.session;
			data['currentTerm'] = data.schoolFees.currentTerm = term;
			let schoolFeesUpdate = g.Settings.update({"_id": id,
													"session": sessionYear,
													"term.currentTerm": term},
													{$set: {"term.$": data}});
			Meteor.call("log","Updated term school fees");

	},
	newStudent: function(data){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
				throw new Meteor.Error('500', 'Unauthorized Operation');
			}
			let duplicateLookUp;
			if(Meteor.isServer){
				duplicateLookUp = Meteor.users.find({$or: [{'emails.address': data.email}, {'username': data.studentId}]}).count();
				if(duplicateLookUp !== 0){
					throw new Meteor.Error('Error occurred', 'Student email or Id already exist.');
				}
			}
				let pass = "@012345#";
				let insertToUser = Accounts.createUser({
						email: data.email,
						username: data.studentId,
						password: pass,
					});
				if(insertToUser){
					Roles.addUsersToRoles(insertToUser, ['student']);
					data.meteorIdInStudent = insertToUser;
					data['firstName'] = g.sentenceCase(data.firstName);
					data['lastName'] = g.sentenceCase(data.lastName);
					data['otherName'] = g.sentenceCase(data.otherName);

					if(data.nok){
						data.nok['name'] = g.sentenceCase(data.nok.name);
					}
					g.Students.insert(data);
					let resultAndPaymentRecord = {
								meteorIdInStudent: data.meteorIdInStudent,
								studentId: data.studentId,
								email: data.email,
								firstName: data.firstName,
								lastName: data.lastName,
								otherName: data.otherName,
								fullName: data.fullName,
								currentClass: data.currentClass,
							};
					g.Results.insert(resultAndPaymentRecord);
					g.Payments.insert(resultAndPaymentRecord);
					Meteor.call("log",("Added new student to "+data.currentClass+" with id "+data.studentId));
					return insertToUser;
				}
		}, //end insertStudent method
	updateStudent: function(target, data){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}
				if(target._id && target.studentId && target.meteorIdInStudent && data){
				let stEdit = g.Students.update({"_id":target._id,
							"meteorIdInStudent":target.meteorIdInStudent,
							"studentId":target.studentId},{$set:data});
					 if(stEdit && data.currentClass){
						g.Results.update({"meteorIdInStudent":target.meteorIdInStudent,
										"studentId":target.studentId},
										{$set:{"currentClass":data.currentClass}});
					 	g.Payments.update({"meteorIdInStudent":target.meteorIdInStudent,
					 					"studentId":target.studentId},
					 					{$set:{"currentClass":data.currentClass}});		 	
					 	Meteor.call("log","edited student profile "+target.studentId);
					 	return;
					 }
				//log
				Meteor.call("log","updated student profile "+target.studentId);
				}else{
					throw new Meteor.Error(500, 'Unknown error occurred, try again.');
				}
	},
//insert staff and Editor by admin and editor only
	newStaff: function(data){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor'])){
				throw new Meteor.Error('500', 'Unauthorized Operation');
			}
			let duplicateLookUp;
			if(Meteor.isServer){
				duplicateLookUp = Meteor.users.find({$or: [{'emails.address': data.email}, {'username': data.staffId}]}).count();
				if(duplicateLookUp !== 0){
					throw new Meteor.Error('Error occurred', 'Staff email or Id already exist.');
				}
			}
				let pass = "@012345#";
				let insertToUser = Accounts.createUser({
						email: data.email,
						username: data.staffId,
						password: pass,
					});
				if(insertToUser){
					Roles.addUsersToRoles(insertToUser, ['staff']);
					//add userId to the staff Collection
					data.meteorIdInStaff = insertToUser;
					data.firstName = g.sentenceCase(data.firstName);
					data.lastName = g.sentenceCase(data.lastName);
					data.otherName = g.sentenceCase(data.otherName);
					
					if(data.nok){
						data.nok.name = g.sentenceCase(data.nok.name);
					}
					g.Staffs.insert(data);
					Meteor.call("log",("added new staff with id "+data.staffId));
					return insertToUser;
				}

		
		}, //end insertStaff method
	editStaff: function(target, data){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}
			if(target._id && target.staffId && data){
				let staffEdit = g.Staffs.update({_id: target._id, staffId: target.staffId}, {$set: data});
				Meteor.call("log",("edited staff employment data, id is "+target.staffId));
			}else{
				throw new Meteor.Error(500, 'Unknown error occurred, try again.');
			}
	},
	removeUser:function(doc){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor','staff'])){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}
			if(doc.type=="staff" && Roles.userIsInRole(this.userId,['admin','editor'])){
				let del = Meteor.users.remove({"_id":doc.meteorIdInStaff});
				if(del){
					g.Staffs.remove({"meteorIdInStaff":doc.meteorIdInStaff});
					Meteor.call("log",("deleted a staff "+doc.firstName+" "+doc.lastName+" "+doc.staffId));
					return;
				} 
			}else if(doc.type=="student"){
				let del = Meteor.users.remove({"_id":doc.meteorIdInStudent});
				if(del){
					g.Students.remove({"meteorIdInStudent":doc.meteorIdInStudent});
					g.Results.remove({"meteorIdInStudent":doc.meteorIdInStudent});
					g.Payments.remove({"meteorIdInStudent":doc.meteorIdInStudent});
					Meteor.call("log",("deleted a student in "+doc.currentClass+" "+doc.firstName+" "+doc.lastName+" "+doc.studentId));
					return;
				}
			}else{
				throw new Meteor.Error(400,'Request not understood!');
			}
	},
	updateResult: function(get, data){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}
			let meteorId, studentId,student;
			if(!g.isEmptyObject(data) && get){
				let setting = g.Settings.findOne({"_id":'default'});
				if(!setting || !setting.term || !setting.session){
					throw new Meteor.Error("Start a new session first!");
				}
					//server only
					if(Meteor.isServer){

						student = g.Students.findOne({
								"meteorIdInStudent":get.target,
								"studentId":get.studentId});
						meteorId = student.meteorIdInStudent;
						studentId = student.studentId;
						data['class'] = student.currentClass;
						data['session'] = setting.session;
						data['term'] = setting.term;
						data['addedBy'] = this.userId;
						for(var i in data){
							if(typeof data[i] === 'object'){
								data[i]["total"] = data[i].ca + data[i].exam;
								data[i]["grade"] = g.calculateGrade(data[i].total);
								data[i]['remark'] = g.remark(data[i].grade);
							}
						}	
					}//end if server only
				}else{
					throw new Meteor.Error(502, 'Error occurred, invalid data');
				}
			// if(g.classArray.indexOf(data['class']) < 0){
			// 	throw new Meteor.Error(301, 'Class specified does not exist', 'Invalid Class');
			// }
			// if(g.termArray.indexOf(data['term']) < 0){
			// 	throw new Meteor.Error(301, 'Term specified does not exist', 'Invalid term');
			// }	
				let checkResultInDb = [];
				let query = g.Results.find({
						"studentId":studentId,
						"meteorIdInStudent":meteorId}).map(function(r){
									return r.result;
						});
				query = query[0];
				if(query){
						for(var i = 0; i < query.length; i++){
							obj = query[i];
							for(var prop in obj){
								if(obj['class'] == data['class'] && obj['term'] == data['term'] /*&& obj['session'] == data['session']*/){
									throw new Meteor.Error(302, "Result already available", "View the result to edit.");
								}
							}
						}
						let resultUpdate = g.Results.update({
											"meteorIdInStudent":meteorId,
											"studentId":studentId},
											{$push: {"result": data}});
						if(resultUpdate){
							console.log("No match in previous result, added");	
						} 
				}else{
					let resultUpdate = g.Results.update({
						"meteorIdInStudent":meteorId,
						"studentId":studentId},
						{$push:{"result":data}});
					if(resultUpdate) console.log("First ever result, added");
				}
			// log
			Meteor.call("log",("created new result for "+studentId));
	},//end updateResult
	//payment by cash
	updatePaymentByCash:function(doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
			throw new Meteor.Error(500, 'Unauthorized Operation');
		}
		//get current setting
		let setting = g.Settings.findOne({"_id":"default"});
			if(!setting || !setting.session || !setting.term){
				throw new Meteor.Error(501, "No Session or term found.");
			}
			//server only
			if(Meteor.isServer){
				let student = g.Students.findOne({
					"meteorIdInStudent":doc.target,
					"studentId":doc.studentId});
					// console.log(doc.studentId,doc.target);
					// console.log(student);return;
				let payment = {};//build payment object securely
					payment.class = student.currentClass;
					payment.term = setting.term;
					payment.session = setting.session;
					payment.category = doc.paymentCategory;
					payment.transactionId = (student.studentId+(new Date().toString().split(" ").join("").substring(0,20))).split(":").join("");
					payment.amount = doc.amount;
					payment.paymentStatus = "Paid";
					payment.paymentType = doc.method;
					payment.paid = true;
					payment.date = new Date();
					payment.addedBy = this.userId;
				let paymentUpdate = g.Payments.update({
									"meteorIdInStudent":student.meteorIdInStudent,
									"studentId":student.studentId},
									{$push:{"payment":payment}});
			//log this action
				if(paymentUpdate){	
					Meteor.call("log",("add new payment for "+
						student.lastName+" "+student.firstName+" ("+
						student.studentId+") in "+student.currentClass));
				}
			}//end if server
			
	},
	updatePaymentByCard:function(doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
			throw new Meteor.Error(500, 'Unauthorized Operation');
		}
		let setting = g.Settings.findOne({"_id":"default"});
			if(!setting || !setting.session || !setting.term){
				throw new Meteor.Error(501, "No Session or term found.");
			}
		if(Meteor.isServer){
			let student = g.Students.findOne({
					"meteorIdInStudent":doc.target,
					"studentId":doc.studentId});
			let payment = {};//build payment object securely
					payment.class = student.currentClass;
					payment.term = setting.term;
					payment.session = setting.session;
					payment.category = doc.paymentCategory;
					payment.transactionId = doc.transactionId;
					payment.amount = doc.amount;
					payment.paymentStatus = "Paid";
					payment.paymentType = doc.method;
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
				Meteor.call("log",("made online payment for "+
					student.lastName+" "+student.firstName+" ("+
					student.studentId+") in "+student.currentClass));
			}
		}//payment
	},
	editResult: function(target, data){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff']) || !target.class || !target.term || !target.session){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}
			for(var i in data){
				if(typeof data[i] == 'object'){
					data[i]["total"] = data[i].ca + data[i].exam;
					data[i]["grade"] = g.calculateGrade(data[i].total);
					data[i]['remark'] = g.remark(data[i].grade);
				}
			}
			data["class"] = target.class;
			data["term"] = target.term;
			data["session"] = target.session;
			data['addedBy'] = this.userId;
			g.Results.update({studentId: target.studentId,
							"result.class": data.class,
							"result.term": data.term,
							"result.session": data.session}, 
							{$set:{"result.$": data}});
			//log
			Meteor.call("log",("edited result for "+target.studentId));
			return target.studentId;
	},
	newAssignment: function(doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}
		if(Meteor.isServer){
			let setting = g.Settings.findOne({"_id":"default"});
			if(!setting || !setting.session || !setting.term){
				throw new Meteor.Error(501, "No Session or term found. Create new session before adding assignment.");
			}
				doc.session = setting.session;
				doc.term = setting.term;
				doc.addedBy = this.userId;
			let tryInsert = g.Assignments.insert(doc);
			Meteor.call("log",("created "+doc.subject+" assignment for "+doc.class));
			return tryInsert;
		}
			
	},
	editAssignment: function(doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}
		let id = doc.id;
		delete doc.id;
		let query = g.Assignments.findOne({'_id': id});
			if(query.addedBy !== this.userId){
				throw new Meteor.Error('500, Editing denied.', 'You do not have the right to edit this assignment.');
			}
		let tryUpdate = g.Assignments.update({'_id': id}, {$set: doc});
		Meteor.call("log",("edited "+doc.subject+" assignment for "+doc.class));
		return tryUpdate;
	},
	scoreAssignment: function(answer){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}
		let query = g.Assignments.findOne({"_id":answer.assignmentId});
			if(query.addedBy !== this.userId){
				throw new Meteor.Error('Scoring denied', 'You do not have the right to mark this answer.');
			}

		let maxScore = query.totalScore;
			if(!maxScore || answer.score > maxScore || answer.score < 0 || !(answer.score)){
				throw new Meteor.Error("Invalid score", "Mark given is out of range");
			}else{
				g.Assignments.update({"_id":answer.assignmentId,
									"answer.id": answer.id},
									{$set:{"answer.$.score":answer.score,
									"answer.$.comment":answer.comment}})
			}
	},
	newMessage: function(message){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
			throw new Meteor.Error(500, 'Unauthorized Operation');
			}
		if(typeof message !== "object"){
			throw new Meteor.Error(500, 'Invalid message received');
		}
		let username = g.Staffs.findOne({"meteorIdInStaff": this.userId});
		message.senderName = (username.lastName || ' ') + ' ' + (username.firstName || ' ') + ' ' + (username.otherName || ' ');
		message.readBy = []; message.readBy.push(this.userId);
		let msgInsert = g.Messages.insert(message);
			Meteor.call("log",("created new a message '"+message.subject+"'"));
		return msgInsert;
	},
	markMessageAsRead:function(msgId){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff','student'])){
			throw new Meteor.Error(500, 'Unauthorized Operation');
		}
		let updateMsg = g.Messages.update({"_id":msgId},{$addToSet:{"readBy":this.userId}});
		let messageSubject = g.Messages.findOne({"_id":msgId}).subject;
			Meteor.call("log",("You opened the message with subject '"+messageSubject+"'"));
	},
	replyMessage: function(doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}
		if(!doc.reply || doc.reply.length < 5){
				throw new Meteor.Error(401, 'Reply too short. At least 5 characters.');
		}
		let userId = this.userId, staff, staffName;
		if(Meteor.isServer){
			staff = g.Staffs.findOne({"meteorIdInStaff":userId});
			staffName = (staff.lastName || "") + " " + (staff.firstName || "") + " " + (staff.otherName || "");
		}
		let replyObj = {"reply":doc.reply,"userId":userId,"name":staffName, "replyDate":new Date()};
		let msgUpdate = g.Messages.update({"_id": doc.id},{$push:{"replies":replyObj}});
		let messageSubject = g.Messages.findOne({"_id":doc.id}).subject;
			Meteor.call("log",("replied to a message with subject '"+messageSubject+"'"));
		return msgUpdate;
	},
	promoteStudents: function(){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor'])){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}
			if(Meteor.isServer){
				let students = g.Students.find();
				if(students.count()<1){throw new Meteor.Error(300,"No student found!")};
				//promote student
				students.forEach(function(std){
					let newClass = g.promoteStudents(std.currentClass);
					//newClass = graduated? move student to graduate list:move to next class
					if(newClass=="Graduated"){
						// delete std._id;//not necessary,maximize random
						//set currentClass to Graduated;
						std.currentClass="Graduated";
						//set graduate year
						std.graduatedYear = new Date().getFullYear();
						let newGrad = g.Graduates.insert(std);
						//remove from students db
						if(newGrad){
							g.Results.update({"meteorIdInStudent":std.meteorIdInStudent,
											"studentId":std.studentId},
											{$set:{"graduated":true}});
							g.Payments.update({"meteorIdInStudent":std.meteorIdInStudent,
											"studentId":std.studentId},
											{$set:{"graduated":true}});							
							g.Students.remove({"_id":newGrad});
						}
					}else{
						g.Students.update({"meteorIdInStudent":std.meteorIdInStudent}, 
						{$set:{"currentClass":newClass}});
					//update currentClass in result and payment
						g.Payments.update({"meteorIdInStudent":std.meteorIdInStudent}, 
							{$set:{"currentClass":newClass}});
						g.Results.update({"meteorIdInStudent":std.meteorIdInStudent}, 
							{$set:{"currentClass":newClass}});
					}//end if
				});
			}
			//when done with promotion, log the action
			Meteor.call("log",("promoted all Students"));
	},
	demoteGraduate:function(doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor'])){
				throw new Meteor.Error(500, 'Unauthorized Operation');
		}
		let stToDemote = g.Graduates.findOne({"_id":doc._id,"studentId":doc.studentId});
			//set class back to SSS3
			stToDemote.currentClass = "SSS3";
			//delete graduated year
			delete stToDemote.graduatedYear;
			//insert to student db
		let insertToStudent = g.Students.insert(stToDemote);
			if(insertToStudent){
				g.Payments.update({"meteorIdInStudent":stToDemote.meteorIdInStudent,
											"studentId":stToDemote.studentId},
											{$set:{"graduated":false}});
				g.Results.update({"meteorIdInStudent":stToDemote.meteorIdInStudent,
											"studentId":stToDemote.studentId},
											{$set:{"graduated":false}});
				g.Graduates.remove({"_id":insertToStudent});
			}
		Meteor.call("log",("demoted a graduated student with id "+doc.studentId+" to SSS3"));
	},
	demoteStudent:function(studentIdArray){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor'])){
			throw new Meteor.Error(500, 'Unauthorized Operation');
		}
		if(studentIdArray.length < 1){
			throw new Meteor.Error(500, 'Insufficient information to perform Operation');
		}
		if(Meteor.isServer){
			studentIdArray.forEach(function(id){
				let std = g.Students.findOne({"meteorIdInStudent":id});
				let newClass = g.demoteStudents(std.currentClass);
						g.Students.update({"meteorIdInStudent":std.meteorIdInStudent}, 
							{$set:{"currentClass":newClass}});
					//update currentClass in result and payment
						g.Payments.update({"meteorIdInStudent":std.meteorIdInStudent}, 
							{$set:{"currentClass":newClass}});
						g.Results.update({"meteorIdInStudent":std.meteorIdInStudent}, 
							{$set:{"currentClass":newClass}});
			});
			Meteor.call("log",("demoted "+studentIdArray.length+" student(s)"));
		}

	},
	pushNotification:function(notification){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor'])){
			throw new Meteor.Error(500, 'Unauthorized Operation');
		}
		let checkWord = notification.split(" ");
		if(checkWord.length < 5){
			throw new Meteor.Error("400","Notification too short!");
		}
		if(Meteor.isServer){
			let checkSetting = g.Settings.findOne({"_id":"default"});
			if(checkSetting && (checkSetting.session && checkSetting.term)){
				Meteor.call("log",("pushed notification"));
				return g.Settings.update({"_id":"default"},{$set:{"notification":notification}});
			}else{
				throw new Meteor.Error(501, "Cannot push notification! No Session or term found.");
			}
		}		
	}
});