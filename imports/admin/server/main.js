import fs from 'fs';
import path from 'path';
Meteor.publish({
	'setting': function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['admin', 'editor', 'staff', 'student'])){
			let appSetting = g.Settings.find({});	
				if(appSetting){
					return appSetting;
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
			let staffList = g.Staffs.find({}, {fields:{firstName:1, lastName:1, otherName: 1, meteorIdInStaff:1}});	
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
			let userId = this.userId;
			if(Roles.userIsInRole(userId, ['admin', 'editor', 'staff'])){
				let assignment = g.Assignments.find({});	
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
	}

});


Meteor.methods({
	'uploadPassport': function(name, argument){
		serverRoot = process.env.PWD;
		let filePath = path.join(serverRoot, name);
		console.log(filePath);
		fs.writeFile(filePath, Buffer.from(argument, 'base64'), function(err){
			if(err){
				throw new Meteor.Error('Error occured', err);
			}
		});
	},

});