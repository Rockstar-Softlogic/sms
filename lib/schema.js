import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';

SimpleSchema.extendOptions(['autoform']);

let stateArray = ["Abia", "Adamawa", "Akwa-Ibom", "Anambra", "Bauchi", "Osun", "Kwara", "Niger"];
let classArray = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3", "Graduated"];
let gradeArray = ["A", "B", "C", "D", "E", "F"];
let remarkArray = ['Excellent', 'Credit', 'Pass', 'Fail', 'Not Offered'];
let clubArray = ["Art", "Science", "Health", "Safety"];
let subjectArray = ["English", "Mathematics", "Physics", "Chemistry", 'Biology', 'Geography', 'Economics','Computer', 'Agric', 'Civic', 'Commerce', 'Accounting', 'Government'];

//Schemas definitions

//School Fees schema
g.Schemas.SchoolFees = new SimpleSchema({
	schoolFees:{
		type: Object,
	},
		"schoolFees.currentTerm": {
			type: Number,
			autoValue: function(){
				gTerm = g.Settings.find({_id: "default"}).term || 0;
					switch(gTerm){
						case 1:
							return 2;
							break;
						case 2:
							return 3;
							break;
						case 3:
							return 1;
							break;
						default:
							return 1;
					}
			},
			autoform: {
				type: "hidden",
			},
		},

		"schoolFees.JSS1": {
			type: Number,
			min: 1000,
			max: 15000000,
			label: "JSS1 school fees",
		},
		"schoolFees.JSS2": {
			type: Number,
			min: 1000,
			max: 15000000,
			label: "JSS2 school fees",
		},
		"schoolFees.JSS3": {
			type: Number,
			min: 1000,
			max: 15000000,
			label: "JSS3 school fees",
		},
		"schoolFees.SSS1": {
			type: Number,
			min: 1000,
			max: 15000000,
			label: "SSS1 school fees",
		},
		"schoolFees.SSS2": {
			type: Number,
			min: 1000,
			max: 15000000,
			label: "SSS2 school fees",
		},
		"schoolFees.SSS3": {
			type: Number,
			min: 1000,
			max: 15000000,
			label: "SSS3 school fees",
		},

}, {tracker: Tracker});


//Settings schema

g.Schemas.Setting = new SimpleSchema({
	session:{
		type: String,
	},
	term: {
		type: Array,
		optional: true,
	},
		'term.&': {
			type: Object,
			blackbox: true,
		},

});

//g.Settings.attachSchema(g.Schemas.Setting);

g.Schemas.Profile = new SimpleSchema({

	state:{
			type: String,
			allowedValues: stateArray,
			label: "State of origin",
		},

	town:{
			type: String,
			label: "Town"
		},

	homeAddress:{
			type: String,
			label: 'Home Address',
		},
	presentAddress:{
			type: String,
			label: "Present Address",
		},

	phone: {
			type: Array,
			label: 'Contact Number',
			minCount: 1,
			maxCount: 3,
		},
			'phone.$':{
				type: String,
				regEx: SimpleSchema.RegEx.Phone,
			},

	club: {
			type: String,
			label: 'Club and Society',
			allowedValues: clubArray,
		},

	
	hobby: {
			type: Array,
			label: 'Hobbies',
			minCount: 1,
			maxCount: 5,
		},

			'hobby.$':{
			type: String,
			},

	nok:{
			type: Object,
			label: "Next of Kin Details",
			optional: true,
		},
			'nok.name':{
				type: String,
				label: "Name NOK",
				max: 40,
				min: 3,
				regEx: /[a-zA-Z-]/g

			},
			'nok.address': {
				type: String,
				label: 'Address of NOK',
				min: 10,
			},

			'nok.phone': {
				type: Array,
				label: 'NOK Mobile',
				minCount: 1,
				maxCount: 2,
			},

			'nok.phone.$':{
				type: String,
				optional: true,
				regEx: SimpleSchema.RegEx.Phone,

			},


			'nok.relationship': {
			type: String,
			label: "Relationship of NOK",
			regEx: /^[a-zA-Z-]/
		},

}, {tracker: Tracker});

//Student schema
g.Schemas.Student = new SimpleSchema({
		
		currentClass:{
			type: String,
			label: "Current Class",
			allowedValues: classArray,
		},

		studentId:{
			type: String,
			label: "Student ID",
			min: 4,
			max: 15,
			regEx: /^[a-z0-9A-Z_]/
		},

		firstName:{
			type: String,
			label: "First Name",
			min: 3,
			max: 30,
			regEx: /^[a-zA-Z-]/

		},
		lastName: {
			type: String,
			label: "Last Name",
			min: 2,
			max: 30,
			regEx: /^[a-zA-Z-]/
		},

		otherName: {
			type: String,
			label: "Other Names",
			optional: true,
			min: 2,
			max: 30,
			regEx: /^[a-zA-Z-]/
		},
		fullName:{
			type: String,
			optional: true,
			autoform:{
				type: 'hidden',
			}
		},

		gender: {
			type: String,
			label: "Gender",
			allowedValues: ['Male', 'Female'],
		},

		dob: {
			type: Date,
			label: "Date of Birth",
			min: new Date(1970, 1, 1),
			max: new Date(2012, 1, 1),
			autoform: {
				type: "bootstrap-datepicker",
			}
		},
		meteorIdInStudent:{
			type: String,
			optional: true,
			autoform:{
				type: 'hidden',
			}
		},


// emails

	email: {
		type: String,
		max: 30,
		min: 8,
		regEx: SimpleSchema.RegEx.Email,
		label: "Email Address",
	},
		
//end emails
	createdAt: {
		type: Date,
		autoValue: function(){
			if(this.isInsert){
				return new Date();
			}
		},
		autoform:{
			type: "hidden",
		},
	},
		
	addedBy: {
		type: String,
		autoValue: function(){
			if(this.isInsert){
				return Meteor.userId();
			}	
		},
		autoform: {
			type: 'hidden',
		},
	},
}, {tracker: Tracker});
//schema for update student info
g.Schemas.UpdateStudent = new SimpleSchema({
	homeAddress:{
			type: String,
			label: 'Home Address',
		},
	presentAddress:{
			type: String,
			label: "Present Address",
		},

	phone: {
			type: Array,
			label: 'Contact Number',
			minCount: 1,
			maxCount: 3,
		},
			'phone.$':{
				type: String,
				regEx: SimpleSchema.RegEx.Phone,
			},

	club: {
			type: String,
			label: 'Club and Society',
			allowedValues: clubArray,
		},

	
	hobby: {
			type: Array,
			label: 'Hobbies',
			minCount: 1,
			maxCount: 5,
		},

			'hobby.$':{
			type: String,
			},

	nok:{
			type: Object,
			label: "Next of Kin Details",
			optional: true,
		},
			'nok.name':{
				type: String,
				label: "Name NOK",
				max: 40,
				min: 3,
				regEx: /[a-zA-Z-]/g

			},
			'nok.address': {
				type: String,
				label: 'Address of NOK',
				min: 10,
			},

			'nok.phone': {
				type: Array,
				label: 'NOK Mobile',
				minCount: 1,
				maxCount: 2,
			},

			'nok.phone.$':{
				type: String,
				optional: true,
				regEx: SimpleSchema.RegEx.Phone,

			},


			'nok.relationship': {
			type: String,
			label: "Relationship of NOK",
			regEx: /[a-zA-Z-]/g
		},

}, {tracker: Tracker});

//schema for edit student info
g.Schemas.EditStudent = new SimpleSchema({
		currentClass:{
			type: String,
			label: "Current Class",
			allowedValues: classArray,
		},

		firstName:{
			type: String,
			label: "First Name",
			min: 3,
			max: 30,
			regEx: /^[a-zA-Z-]/
		},
		lastName: {
			type: String,
			label: "Last Name",
			min: 2,
			max: 30,
			regEx: /^[a-zA-Z-]/
		},

		otherName: {
			type: String,
			label: "Other Names",
			optional: true,
			min: 2,
			max: 30,
			regEx: /^[a-zA-Z-]/
		},

		dob: {
			type: Date,
			label: "Date of Birth",
			min: new Date(1970, 1, 1),
			max: new Date(2012, 1, 1),
			autoform: {
				type: "bootstrap-datepicker",
			}
		},
		gender: {
			type: String,
			label: "Gender",
			allowedValues: ['Male', 'Female'],
		},

		state:{
			type: String,
			allowedValues: stateArray,
			label: "State of origin",
		},

		town:{
				type: String,
				label: "Town"
		},

		club: {
			type: String,
			label: 'Club and Society',
			allowedValues: clubArray,
		},

}, {tracker: Tracker});


g.Schemas.Student.extend(g.Schemas.Profile);
g.Students.attachSchema(g.Schemas.Student);

// end student schema
//Staff schema
g.Schemas.Staff = new SimpleSchema({

		firstName:{
			type: String,
			label: "First Name",
			min: 3,
			max: 30,
			regEx: /^[a-zA-Z-]/
		},
		lastName: {
			type: String,
			label: "Last Name",
			min: 2,
			max: 30,
			regEx: /^[a-zA-Z-]/
		},

		otherName: {
			type: String,
			label: "Other Names",
			optional: true,
			min: 2,
			max: 50,
			regEx: /^[a-zA-Z-]/
		},
		fullName:{
			type: String,
			optional: true,
			autoform:{
				type: 'hidden',
			}
		},

		gender: {
			type: String,
			label: "Gender",
			allowedValues: ['Male', 'Female'],
		},

		dob: {
			type: Date,
			label: "Date of Birth",
			max: new Date(2000, 1, 1),
			min: new Date(1930, 1, 1),
			autoform: {
				type: "bootstrap-datepicker",
			}
		},

// email and username and subject

		email: {
			type: String,
			max: 30,
			min: 8,
			regEx: SimpleSchema.RegEx.Email,
			label: "Email Address",
		},
		staffId: {
			type: String,
			label: "Staff ID",
			min: 4,
			max: 15,
			regEx: /^[a-z0-9A-Z_]/
		},
		subjectTaught: {
			type: Array,
			maxCount: 10,
			minCount: 1,
			label: "Subject(s) Taught",
		},
			"subjectTaught.$":{
				type: String,
			},
//end email and username and subject
		meteorIdInStaff:{
				type: String,
				optional: true,
				autoform:{
					type: 'hidden',
				}
			},
			
	
		createdAt: {
			type: Date,
			autoValue: function(){
				if(this.isInsert){
					return new Date();
				}
			},
			autoform:{
				type: "hidden",
			},
		},
			
		addedBy: {
			type: String,
			autoValue: function(){
					return Meteor.userId();	
			},
			autoform: {
				type: 'hidden',
			},
		},
	}, {tracker: Tracker});

//update and edit staff schema
g.Schemas.UpdateStaff = new SimpleSchema({
	homeAddress:{
			type: String,
			label: 'Home Address',
		},
	presentAddress:{
			type: String,
			label: "Present Address",
		},

	phone: {
			type: Array,
			label: 'Contact Number',
			minCount: 1,
			maxCount: 3,
		},
			'phone.$':{
				type: String,
				regEx: SimpleSchema.RegEx.Phone,
			},

	club: {
			type: String,
			label: 'Club and Society',
			allowedValues: clubArray,
		},

	
	hobby: {
			type: Array,
			label: 'Hobbies',
			minCount: 1,
			maxCount: 5,
		},

			'hobby.$':{
			type: String,
			},

	nok:{
			type: Object,
			label: "Next of Kin Details",
			optional: true,
		},
			'nok.name':{
				type: String,
				label: "Name NOK",
				max: 40,
				min: 3,
				regEx: /^[a-zA-Z]/

			},
			'nok.address': {
				type: String,
				label: 'Address of NOK',
				min: 10,
			},

			'nok.phone': {
				type: Array,
				label: 'NOK Mobile',
				minCount: 1,
				maxCount: 2,
			},

			'nok.phone.$':{
				type: String,
				optional: true,
				regEx: SimpleSchema.RegEx.Phone,

			},


			'nok.relationship': {
			type: String,
			label: "Relationship of NOK",
			regEx: /^[a-zA-Z]/
		},

}, {tracker: Tracker});

//schema for edit staff info
g.Schemas.EditStaff = new SimpleSchema({

		firstName:{
			type: String,
			label: "First Name",
			min: 3,
			max: 30,
			regEx: /^[a-zA-Z]/
		},
		lastName: {
			type: String,
			label: "Last Name",
			min: 2,
			max: 30,
			regEx: /^[a-zA-Z]/
		},

		otherName: {
			type: String,
			label: "Other Names",
			optional: true,
			min: 2,
			max: 30,
			regEx: /^[a-zA-Z]/
		},
		dob: {
			type: Date,
			label: "Date of Birth",
			min: new Date(1970, 1, 1),
			max: new Date(2012, 1, 1),
			autoform: {
				type: "bootstrap-datepicker",
			}
		},
		gender: {
			type: String,
			label: "Gender",
			allowedValues: ['Male', 'Female'],
		},

		state:{
			type: String,
			allowedValues: stateArray,
			label: "State of origin",
		},

		town:{
				type: String,
				label: "Town"
		},

		club: {
			type: String,
			label: 'Club and Society',
			allowedValues: clubArray,
		},
		subjectTaught: {
			type: Array,
			maxCount: 10,
			minCount: 1,
			label: "Subject(s) Taught",
		},
			"subjectTaught.$":{
				type: String,
			},


}, {tracker: Tracker});

g.Schemas.Staff.extend(g.Schemas.Profile);
g.Staffs.attachSchema(g.Schemas.Staff);

//end Staff Schema

//Result Schema
g.Schemas.Result = new SimpleSchema({
		meteorIdInStudent:{
			type: String,
			
		},
		studentId:{
			type: String,
			
		},
		email:{
			type: String,
			regEx: SimpleSchema.RegEx.Email,
		},
		firstName:{
			type: String,
			label: "First Name",
			min: 3,
			max: 30,
			regEx: /^[a-zA-Z]/
		},
		lastName: {
			type: String,
			label: "Last Name",
			min: 2,
			max: 30,
			regEx: /^[a-zA-Z]/
		},

		otherName: {
			type: String,
			label: "Other Names",
			optional: true,
			min: 2,
			max: 30,
			regEx: /^[a-zA-Z]/
		},
		
		fullName:{
			type: String,
			optional: true,
			autoform:{
				type: 'hidden',
			}
		},
		currentClass:{
			type: String,
			label: "Current Class",
			allowedValues: classArray,
		},
		
		result:{
			type: Array,
			optional: true,
		},
			'result.$':{
				type: Object,
				blackbox: true,
			},
});

g.Results.attachSchema(g.Schemas.Result);
// Dealing with results schema


g.Schemas.ResultArray = new SimpleSchema({
		
		mathematics: {
			type: Object,
		},
			'mathematics.ca':{
				type: Number,
				min: 0,
				max: 40,
				label: "Continous Assessment",
				defaultValue: 0,
			},
			'mathematics.exam':{
				type: Number,
				min: 0,
				max: 60,
				label: "Examination score",
				optional: true,
				defaultValue: 0,
			},
		english: {
			type: Object,
		},
			'english.ca':{
				type: Number,
				min: 0,
				max: 40,
				label: "Continous Assessment",
				defaultValue: 0,
			},
			'english.exam':{
				type: Number,
				min: 0,
				max: 60,
				label: "Examination score",
				optional: true,
				defaultValue: 0,
			},
		physics: {
			type: Object,
			optional: true,
		},
			'physics.ca':{
				type: Number,
				min: 0,
				max: 40,
				label: "Continous Assessment",
				defaultValue: 0,
			},
			'physics.exam':{
				type: Number,
				min: 0,
				max: 60,
				label: "Examination score",
				defaultValue: 0,
				optional: true,
			},
		chemistry: {
			type: Object,
			optional: true,
		},
			'chemistry.ca':{
				type: Number,
				min: 0,
				max: 40,
				label: "Continous Assessment",
				defaultValue: 0,
			},
			'chemistry.exam':{
				type: Number,
				min: 0,
				max: 60,
				label: "Examination score",
				defaultValue: 0,
				optional: true,
			},
		biology: {
			type: Object,
			optional: true,
		},
			'biology.ca':{
				type: Number,
				min: 0,
				max: 40,
				label: "Continous Assessment",
				defaultValue: 0,
			},
			'biology.exam':{
				type: Number,
				min: 0,
				max: 60,
				label: "Examination score",
				defaultValue: 0,
				optional: true,
			},
		geography: {
			type: Object,
			optional: true,
		},
			'geography.ca':{
				type: Number,
				min: 0,
				max: 40,
				label: "Continous Assessment",
				defaultValue: 0,
			},
			'geography.exam':{
				type: Number,
				min: 0,
				max: 60,
				label: "Examination score",
				defaultValue: 0,
				optional: true,
			},
		economics: {
			type: Object,
			optional: true,
		},
			'economics.ca':{
				type: Number,
				min: 0,
				max: 40,
				label: "Continous Assessment",
				defaultValue: 0,
			},
			'economics.exam':{
				type: Number,
				min: 0,
				max: 60,
				label: "Examination score",
				defaultValue: 0,
				optional: true,
			},
		account: {
			type: Object,
			optional: true,
		},
			'account.ca':{
				type: Number,
				min: 0,
				max: 40,
				label: "Continous Assessment",
				defaultValue: 0,
			},
			'account.exam':{
				type: Number,
				min: 0,
				max: 60,
				label: "Examination score",
				defaultValue: 0,
				optional: true,
			},
		commerce: {
			type: Object,
			optional: true,
		},
			'commerce.ca':{
				type: Number,
				min: 0,
				max: 40,
				label: "Continous Assessment",
				defaultValue: 0,
			},
			'commerce.exam':{
				type: Number,
				min: 0,
				max: 60,
				label: "Examination score",
				defaultValue: 0,
				optional: true,
			},
		government: {
			type: Object,
			optional: true,
		},
			'government.ca':{
				type: Number,
				min: 0,
				max: 40,
				label: "Continous Assessment",
				defaultValue: 0,
			},
			'government.exam':{
				type: Number,
				min: 0,
				max: 60,
				label: "Examination score",
				defaultValue: 0,
				optional: true,
			},
		
}, {tracker: Tracker});

//end dealing with results schema
//payment schema

g.Schemas.PaymentArray = new SimpleSchema({
	class:{
		type: String,
		allowedValues: classArray,
	},
	term: {
		type: Number,
		allowedValues: [1, 2, 3],
	},

	category: {
		type: String,
		allowedValues: ["School fees", "Accommodation"],
	},

	transactionId: {
		type: String,
		min: 10,
	},
	amount: {
		type: Number,
		min: 1000,
	},

	paymentStatus: {
		type: String,
		allowedValues: ["Paid", "Not paid"],
	},
	paymentType:{
		type: String,
		allowedValues: ["remita", "cash"]
	},

	date: {
		type: Date,
		autoValue: function(){
				if(this.isInsert){
					return new Date();
				}
			},
		autoform: {
			type: "hidden",
		},
	},

	session: {
		type: String,
	},
	paid: {
		type: Boolean,
		
	},
	addedBy: {
		type: String,
		autoValue: function(){return this.userId},
		autoform: {
			type: 'hidden'
		},
	}
	
}, {tracker: Tracker});

g.Schemas.Payment = new SimpleSchema({
		meteorIdInStudent:{
			type: String,
			
		},
		studentId:{
			type: String,
			
		},
		email:{
			type: String,
			regEx: SimpleSchema.RegEx.Email,
		},
		firstName:{
			type: String,
			label: "First Name",
			min: 3,
			max: 30,
			regEx: /[a-zA-Z-]/
		},
		lastName: {
			type: String,
			label: "Last Name",
			min: 2,
			max: 30,
			regEx: /[a-zA-Z-]/
		},

		otherName: {
			type: String,
			label: "Other Names",
			optional: true,
			min: 2,
			max: 30,
			regEx: /[a-zA-Z-]/
		},
		
		fullName:{
			type: String,
			optional: true,
			autoform:{
				type: 'hidden',
			}
		},
		currentClass:{
			type: String,
			label: "Current Class",
			allowedValues: classArray,
		},
		
		payment:{
			type: Array,
			optional: true,
		},
			'payment.$':{
				type: g.Schemas.PaymentArray,
			},
});

g.Payments.attachSchema(g.Schemas.Payment);

g.Schemas.Assignment = new SimpleSchema({
		title: {
			type: String,
			min: 10,
			max: 100,
			label: "Title of Assignment",
		},
		content: {
			type: String,
			min: 20,
			max: 1000,
			label: "Assignment content",
			autoform: {
				rows: 5,
			},

		},
		class: {
			type: String,
			allowedValues: classArray,
		},
		subject: {
			type: String,
			allowedValues: subjectArray,
		},
		totalScore: {
			type: Number,
			min: 0,
			max: 40,
			label: 'Total score'
		},

		startDate: {
			type: Date,
			autoValue: function(){if(this.isInsert){return new Date();}},
			autoform:{
				type: 'hidden',
			},
		},
		endDate: {
			type: Date,
			label: "End date",
			autoform: {
				type: "bootstrap-datepicker",
			},
			min: new Date(),
		},
		addedBy: {
			type: String,
			autoValue: function(){if(this.isInsert){return this.userId;}},
			autoform: {
				type: 'hidden',
			}
		},
		answer: {
			type: Array,
			optional: true,
		},
			"answer.$": {
				type: Object,
				blackbox: true,
			},

},{tracker: Tracker});

g.Assignments.attachSchema(g.Schemas.Assignment);

g.Schemas.Message = new SimpleSchema({
		from: {
			type: String,
			autoValue: function(){if(this.isInsert){return this.userId;}},
			autoform: {
				type: 'hidden',
			}
		},
		senderName:{
			type: String,
			optional: true,
			autoform:{
				type: 'hidden',
			},
		},
		to: {
			type: Array,
			minCount: 1,
		},
			'to.$':{
				type: String,
			},
		staffName:{
			type: Array,
			optional: true,
			autoform:{
				type: 'hidden',
			},
		},
			'staffName.$':{
				type: String,
			},
		studentName:{
			type: Array,
			optional: true,
			autoform:{
				type: 'hidden',
			},
		},
			'studentName.$':{
				type: String,
			},

		subject: {
			type: String,
			label: 'Subject of the message',
			min: 15,
			max: 75,
		},
		content:{
			type: String,
			min: 50,
			label: 'Content of the message',
			autoform: {
				rows: 5,
			},

		},
		createdAt:{
			type: Date,
			autoValue: function(){if(this.isInsert){return new Date();}},
			autoform:{
				type: 'hidden',
			},
		},
		readStatus:{
			type: Boolean,
			defaultValue: false,
			autoform:{
				type: 'hidden',
			},
		},

		replies:{
			type: Array,
			optional: true,
		},
			'replies.$':{
				type: Object,
				blackbox: true,
			},
}, {tracker: Tracker});

g.Messages.attachSchema(g.Schemas.Message);