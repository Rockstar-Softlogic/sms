Meteor.publish({
	'student.info': function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['student'])){
			currentStudent = g.Students.find({meteorIdInStudent: userId});	
				if(currentStudent){
					return currentStudent;
				}
		}
		return this.ready();
	},
	'student.result': function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['student'])){
			let stResult = g.Results.find({meteorIdInStudent: userId});
				if(stResult){
					return stResult;	
				}
		}
		return this.ready();
	},
	'student.payment': function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['student'])){
			let stPayment = g.Payments.find({meteorIdInStudent: userId});
				if(stPayment){
					return stPayment;	
				}
		}
		return this.ready();
	},
	'student.assignment': function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['student'])){
			let assignmentClass = g.Students.findOne({meteorIdInStudent: userId}).currentClass;
			let stAssignment = g.Assignments.find({class: assignmentClass});
			if(stAssignment) return stAssignment;
		}
		return this.ready();
	},
	'st.staffName': function(){
		let userId = this.userId;
		if(Roles.userIsInRole(userId, ['student'])){
			let staff = g.Staffs.find({},{fields:{firstName:1, lastName:1, otherName: 1, meteorIdInStaff:1, staffId:1}});
			if(staff) return staff;
		}
		return this.ready();
	}
});