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
			let editor = Meteor.users.find({roles: "editor"});
				if(editor){
					return editor;
				}
		}
		return this.ready();
	},

	'staff.info': function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['admin', 'editor', 'staff'])){
			let currentStaff = g.Staffs.find({meteorIdInStaff: userId});	
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
			let staffList = g.Staffs.find({}, {fields:{firstName:1, lastName:1, otherName: 1, meteorIdInStaff:1, staffId:1}});	
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
	'lastResult.check': function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['admin', 'editor', 'staff'])){
			let resultList = g.Results.find({}, {fields: {
													"result": {"$slice": -1},
													"studentId": 1,
													"meteorIdInStudent": 1,
													"firstName": 1,
													"lastName": 1,
													"otherName": 1,
													"currentClass": 1,}});	
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

	'lastPayment.check': function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['admin', 'editor', 'staff'])){
			let paymentList = g.Payments.find({}, {fields: {
													"payment": {"$slice": -1},
													"studentId": 1,
													"meteorIdInStudent": 1,
													"firstName": 1,
													"lastName": 1,
													"otherName": 1,
													"currentClass": 1,}});	
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
					let messages = g.Messages.find({$or: [{from: userId}, {to: userId}, {to: 'all_staff'}]});	
						if(messages){
							return messages;
						}
				}
				return this.ready();
	},
	'feedback.list': function(){
			let userId = this.userId;
				if(Roles.userIsInRole(userId, ['admin'])){
					let feedback = g.Feedbacks.find();	
						if(feedback){
							return feedback;
						}
				}
				return this.ready();
	}

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
	toggleAdmin:function(staffId, staffUsername, action){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin'])){
				throw new Meteor.Error('500', 'Unauthorized Operation');
			}
			if(!staffId || !staffUsername || !action){
				throw new Meteor.Error('500', 'Incomplete information to perform opeartion');
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
				throw new Meteor.Error(500, "Request not understood!");
			}
	},
});

