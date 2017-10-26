import fs from 'fs';
import path from 'path';
Meteor.publish({
	'setting': function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['admin', 'editor', 'staff', 'student'])){
			let appSetting = g.Settings.find();	
				if(appSetting){
					return appSetting;
				}
		}
		return this.ready();
	},
	'editor.list':function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ["admin"])){
			let editor = Meteor.users.find({roles: "editor"},{fields:{roles:1}});
				if(editor){
					return editor;
				}
		}
		return this.ready();
	},
	'staff.info': function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['admin', 'editor', 'staff'])){
			let currentStaff = g.Staffs.find({meteorIdInStaff:userId});	
				if(currentStaff){
					return currentStaff;
				}
		}
		return this.ready();
	},
	'staff.list': function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['admin', 'editor'])){
			let staffList = g.Staffs.find({});	
				if(staffList){
					return staffList;
				}
		}
		return this.ready();
	},
	'staff.name': function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['admin', 'editor', 'staff'])){
			let staffList = g.Staffs.find({}, {fields:{firstName:1, lastName:1, otherName: 1, meteorIdInStaff:1, staffId:1,phone:1}});	
				if(staffList){
					return staffList;
				}
		}
		return this.ready();
	},

	'student.list': function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['admin', 'editor', 'staff'])){
			let studentList = g.Students.find({});	
				if(studentList){
					return studentList;
				}
		}
		return this.ready();
	},
	'graduate.list': function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['admin', 'editor', 'staff'])){
			let graduateList = g.Graduates.find({});	
				if(graduateList){
					return graduateList;
				}
		}
		return this.ready();
	},
	'result.list': function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['admin', 'editor', 'staff'])){
			let resultList = g.Results.find({});	
				if(resultList){
					return resultList;
				}
		}
		return this.ready();
	},
	'payment.list': function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['admin', 'editor', 'staff'])){
			let paymentList = g.Payments.find({});	
				if(paymentList){
					return paymentList;
				}
		}
		return this.ready();
	},
	'assignment.list': function(){
			let userId = this.userId, assignment;
			if(Roles.userIsInRole(userId, ['admin', 'editor'])){
					assignment = g.Assignments.find({});	
					if(assignment){
						return assignment;
					}
			}else if(Roles.userIsInRole(userId, ['staff'])){
					assignment = g.Assignments.find({addedBy:userId});
					if(assignment){
						return assignment;
					}
			}
			return this.ready();
	},
	'message.list': function(){
			let userId = this.userId;
				if(Roles.userIsInRole(userId, ['admin', 'editor', 'staff'])){
					let messages = g.Messages.find({$or:[{"senderId":userId},{"toStaff":userId}]});	
						if(messages){
							return messages;
						}
				}
				return this.ready();
	},
	'log.list':function(){
		let userId = this.userId,logs;
		if(Roles.userIsInRole(userId, ['admin', 'editor'])){
			logs = g.Logs.find({},{sort:{time:-1}});
			if(logs){
				return logs;
			}
		}else if(Roles.userIsInRole(userId, ['staff','student'])){
			logs = g.Logs.find({"by":this.userId},{sort:{time:-1}});
			if(logs){
				return logs;
			}
		}
		return this.ready();
	},
	'subject.list': function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['admin', 'editor', 'staff','student'])){
			let subjectList = g.Subjects.find({"_id":"default"});	
				if(subjectList){
					return subjectList;
				}
		}
		return this.ready();
	},
});

Meteor.methods({
	'uploadPassport':function(name, argument){
		serverRoot = process.env.PWD;
		let filePath = path.join(serverRoot, name);
		console.log(filePath);
		fs.writeFile(filePath, Buffer.from(argument, 'base64'), function(err){
			if(err){
				throw new Meteor.Error('Error occured', err);
			}
		});
	},
	toggleAdmin:function(doc){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin'])){
				throw new Meteor.Error('500', 'Unauthorized Operation');
			}
			let staffId = doc.staffId,
				staffUsername = doc.staff,
				action = doc.action;
			delete doc;
			if(!staffId || !staffUsername || !action){
				throw new Meteor.Error('500', 'Incomplete information to perform operation');
			}
			if(Roles.userIsInRole(staffId, ['editor']) && action == "remove"){
				let removeAdmin = Roles.setUserRoles(staffId, ['staff']);
				console.log(removeAdmin);
				return removeAdmin;
			}else if(Roles.userIsInRole(staffId, ['staff']) && action == "add"){
				let addAdmin = Roles.addUsersToRoles(staffId, ['editor', 'staff']);
				console.log(addAdmin);
				return addAdmin;
			}else{
				throw new Meteor.Error(400, "Request not understood!");
			}
	},
	newStudent: function(data){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
			throw new Meteor.Error('500', 'Unauthorized Operation');
		}
		let requiredFields = ["firstName","lastName","gender","currentClass","studentId","parentOrGuardian"];
		for(let i = 0; i < requiredFields.length; i++){
			if(!data[requiredFields[i]]){
				throw new Meteor.Error(401, `required field ${requiredFields[i]} is missing.`);
			}
		}//end for
		// check parentOrGuardian name && phone
		if(!data.parentOrGuardian.name || !data.parentOrGuardian.phone){
			throw new Meteor.Error(401, `Parent or Guardian name or phone is missing.`);
		}//end if
		//everything is fine, process
			let pwd = "12345",
				newUser = {username:data.studentId,password:pwd};
			if(data.email){
				newUser.email = data.email;
			}
			let insertToUser = Accounts.createUser(newUser);
			if(insertToUser){
				Roles.addUsersToRoles(insertToUser, ['student']);
				data.meteorIdInStudent = insertToUser;
				data['firstName'] = g.sentenceCase(data.firstName);
				data['lastName'] = g.sentenceCase(data.lastName);
				data['otherName'] = g.sentenceCase(data.otherName)||"";
				if(data.nok){
					data.nok['name'] = g.sentenceCase(data.nok.name);
				}
				let insertToStudent = g.Students.insert(data);
				let resultAndPaymentRecord = {
						meteorIdInStudent: data.meteorIdInStudent,
						studentId: data.studentId,
						email: data.email||"",
						firstName: data.firstName,
						lastName: data.lastName,
						otherName: data.otherName,
						currentClass: data.currentClass,
					};
				g.Results.insert(resultAndPaymentRecord);
				g.Payments.insert(resultAndPaymentRecord);
				Meteor.call("log",("Added new student to "+data.currentClass+" with id "+data.studentId));
				return insertToUser;
			}
		}, //end insertStudent method
		//insert staff and Editor by admin and editor only
	newStaff: function(data){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor'])){
			throw new Meteor.Error('500', 'Unauthorized Operation');
		}
		let requiredFields = ["firstName","lastName","gender","staffId"];
		for(let i = 0; i < requiredFields.length; i++){
			if(!data[requiredFields[i]]){
				throw new Meteor.Error(401, `required field ${requiredFields[i]} is missing.`);
			}
		}//end for
			let pwd = "12345",
				newUser = {username:data.staffId,password:pwd};
			if(data.email){
				newUser.email = data.email;
			}
			let insertToUser = Accounts.createUser(newUser);
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
});

