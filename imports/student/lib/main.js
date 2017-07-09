Meteor.methods({
	updateStudentProfile: function(data){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['student'])){
				throw new Meteor.Error('500', 'Unauthorized Operation');
			}
		let userId = this.userId,
			stUpdate = g.Students.update({meteorIdInStudent: userId}, {$set: data});

			return stUpdate;
	},

	'submitAssignmentAnswer': function(doc, stAnswer){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['student'])){
				throw new Meteor.Error('500', 'Unauthorized Operation');
			}

		if(stAnswer.length > 120){
			let userId = this.userId,
				currentClass = g.Students.findOne({meteorIdInStudent: userId}).currentClass;
			let endDate = g.Assignments.findOne({class: currentClass, _id: doc._id, subject: doc.subject}).endDate;
			if(endDate < (new Date())){
				throw new Meteor.Error('Unauthorized submission', 'Assignment has expired. No submission is allowed.');
			}
			let obj = {"id": userId, "text": stAnswer, "date": new Date()};
			let updateAnswer = g.Assignments.update({class: currentClass, _id: doc._id, subject: doc.subject},
								{$addToSet: {answer: obj}});
			return updateAnswer;
		}else{
			throw new Meteor.Error("Invalid answer", "Please review your answer, too short or empty answer!");
		}
	}
});