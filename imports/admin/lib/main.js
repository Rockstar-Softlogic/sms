

Meteor.methods({
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

				}else{
					throw new Meteor.Error('Session Error', 'Error occurred while creating new session.');

				}
			
	},

	setTermAndSchoolFees: function(doc, id, sessionYear){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor'])){
				throw new Meteor.Error('500', 'Unauthorized Operation');
			}
			let term = g.Settings.findOne({_id: "default"}).term;

				if(doc['currentTerm'] == 1 && sessionYear && id){
					 g.Settings.update({"_id": id, session: sessionYear},{$addToSet:{term:doc}});
				}else if(term == 1 || term == 2){
					
					let id = g.Settings.findOne({_id: "default"}).settingId;
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
						
						doc.schoolFees.currentTerm = term;
						doc.currentTerm = term;

						sessionYear = g.Settings.findOne({_id: "default"}).session;
					let insertSchoolFees = g.Settings.update({"_id": id, session: sessionYear}, {$addToSet: {term: doc}});	
						if(insertSchoolFees){
							g.Settings.update({"_id": "default", session: sessionYear}, {$set: {term: term}});
						}
				}else{
					throw new Meteor.Error("Error occurred", "You can't create new term after third term, create new session instead");
				}
	},
	updateSchoolFees: function(data){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor'])){
				throw new Meteor.Error('500', 'Unauthorized Operation');
			}
			let term = g.Settings.findOne({_id: "default"}).term;
			let id = g.Settings.findOne({_id: "default"}).settingId;
			let	sessionYear = g.Settings.findOne({_id: "default"}).session;

			data['currentTerm'] = data.schoolFees.currentTerm = term;
			let schoolFeesUpdate = g.Settings.update({_id: id,
													session: sessionYear,
													'term.currentTerm': term},
													{$set: {'term.$': data}});
	},

	createStudent: function(data){
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
					data['firstName'] = sentenceCase(data.firstName);
					data['lastName'] = sentenceCase(data.lastName);
					data['otherName'] = sentenceCase(data.otherName);

					if(data.nok){
						data.nok['name'] = sentenceCase(data.nok.name);
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
				}
		}, //end insertStudent method
	editStudent: function(target, data){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}

			if(target._id && target.studentId && data){
				let stEdit = g.Students.update({_id: target._id, studentId: target.studentId}, {$set: data});
							 g.Results.update({_id: target._id, studentId: target.studentId}, {$set: {currentClass: data.currentClass}});
							 g.Payments.update({_id: target._id, studentId: target.studentId}, {$set: {currentClass: data.currentClass}});
			}else{
				throw new Meteor.Error(500, 'Unknown error occurred, try again.');
			}

	},
	updateStudent: function(target, data){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}
			if(target._id && target.studentId && data){
				let stUpdate = g.Students.update({_id: target._id, studentId: target.studentId},{$set: data});
			}else{
				throw new Meteor.Error(500, 'Unknown error occurred, try again.');
			}

	},

//insert staff and Editor by admin and editor only
	createStaff: function(data){

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
					data.firstName = sentenceCase(data.firstName);
					data.lastName = sentenceCase(data.lastName);
					data.otherName = sentenceCase(data.otherName);
					
					if(data.nok){
						data.nok.name = sentenceCase(data.nok.name);
					}

					g.Staffs.insert(data);
				}

		
		}, //end insertStaff method
	editStaff: function(target, data){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}

			if(target._id && target.staffId && data){
				let staffEdit = g.Staffs.update({_id: target._id, staffId: target.staffId}, {$set: data});
			}else{
				throw new Meteor.Error(500, 'Unknown error occurred, try again.');
			}

	},
	updateStaff: function(target, data){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}
			if(target._id && target.staffId && data){
				let staffUpdate = g.Staffs.update({_id: target._id, staffId: target.staffId},{$set: data});
			}else{
				throw new Meteor.Error(500, 'Unknown error occurred, try again.');
			}

	},

	updateResult: function(get, data){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}
			
			let meteorId, studentId;
			if(!isEmptyObject(data) && get){
				let term = g.Settings.findOne({_id: 'default'}).term;
					meteorId = get.target;
					studentId = get.studentId;
					data['class'] = get.currentClass;
					data['session'] = new Date().getFullYear();
					data['term'] = term;
					data['addedBy'] = this.userId;

					for(var i in data){
						if(typeof data[i] == 'object'){
							data[i]["total"] = data[i].ca + data[i].exam;
							data[i]["grade"] = calculateGrade(data[i].total);
							data[i]['remark'] = remark(data[i].grade);
						}
					}	

				}else{
					throw new Meteor.Error(502, 'Error occurred, invalid data');
				}


			let classArray = ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'];
			let termArry = [1, 2, 3];
			
			if(classArray.indexOf(data['class']) < 0){
				throw new Meteor.Error(301, 'Class specified do not exist', 'Invalid Class');
			}
			if(termArry.indexOf(data['term']) < 0){
				throw new Meteor.Error(301, 'Term specified do not exist', 'Invalid term');
			}	

				let checkResultInDb = [];
				let query = g.Results.find({studentId: studentId,
													meteorIdInStudent: meteorId}).map(function(r){
														return r.result;
													});

				query = query[0];
				if(query){
						for(var i = 0; i < query.length; i++){
							obj = query[i];
							for(var prop in obj){
								if(obj['class'] == data['class'] && obj['term'] == data['term'] && obj['session'] == data['session']){
									console.log('match found!, terminating');
									throw new Meteor.Error(302, "Result already available", "View the result to edit.");
									
								}
							}
							
						}

						let resultUpdate = g.Results.update({meteorIdInStudent: meteorId, studentId: studentId},
											{$push: {result: data}});
						if(resultUpdate) console.log("No match in previous result, added");

				}else{
					let resultUpdate = g.Results.update({meteorIdInStudent: meteorId, studentId: studentId},
							{$push: {result: data}});
					if(resultUpdate) console.log("First ever result, added");
				}
		
	},//end updateResult

	promoteStudent: function(){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor'])){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}

			g.Students.find().forEach(function(std){
				g.Students.update({_id: std._id}, 
					{$set: {currentClass: promoteStudent(std.currentClass)}});
			});
	},
	editResult: function(target, data){
			if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff']) || !target.class || !target.term || !target.session){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}
			
			for(var i in data){
				if(typeof data[i] == 'object'){
					data[i]["total"] = data[i].ca + data[i].exam;
					data[i]["grade"] = calculateGrade(data[i].total);
					data[i]['remark'] = remark(data[i].grade);
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
			
			return target.studentId;
	},
	createAssignment: function(doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}
			doc.addedBy = this.userId;
		let tryInsert = g.Assignments.insert(doc);
			return tryInsert;
	},
	editAssignment: function(id, doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}

		let query = g.Assignments.findOne({'_id': id});
			if(query.addedBy !== this.userId){
				throw new Meteor.Error('Editing denied', 'You do not have the right to edit this assignments.');
			}

		let tryUpdate = g.Assignments.update({'_id': id}, {$set: doc});
		return tryUpdate;
	},
	scoreAssignment: function(id, doc){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}
		let query = g.Assignments.findOne({_id: id});
			if(query.addedBy !== this.userId){
				throw new Meteor.Error('Scoring denied', 'You do not have the right to mark this answer.');
			}

		let maxScore = query.totalScore;
			if(!maxScore || doc.score > maxScore || doc.score < 0 || !(doc.score)){
				throw new Meteor.Error("Invalid score", "Mark given is out of range");
			}else{
				g.Assignments.update({_id: id, "answer.id": doc.id}, {$set: {"answer.$.score": doc.score, "answer.$.comment": doc.comment}})
			}
	},
	createMessage: function(message){
		if(!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
				throw new Meteor.Error(500, 'Unauthorized Operation');
			}
		let username = g.Staffs.findOne({meteorIdInStaff: this.userId});
		message.senderName = (username.lastName || ' ') + ' ' + (username.firstName || ' ') + ' ' + (username.otherName || ' ');
		let msgInsert = g.Messages.insert(message);
		return msgInsert;
	}

});

function promoteStudent(currentClass){
	switch(currentClass){
		case 'JSS1':
			return 'JSS2';
		case 'JSS2':
			return 'JSS3';
		case 'JSS3':
			return 'SSS1';
		case 'SSS1':
			return 'SSS2';
		case 'SSS2':
			return 'SSS3';
		case 'SSS3':
			return 'Graduated';
		case 'Graduated':
			return "Graduated";

		default:
			return 'invalid';
	}
}

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