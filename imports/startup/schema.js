import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
SimpleSchema.extendOptions(['autoform']);
//Schemas definitions
//School Fees schema
g.Schemas.SchoolFees = new SimpleSchema({
	schoolFees:{
		type: Object,
	},
		"schoolFees.currentTerm": {
			type: Number,
			autoValue: function(){
				let term = g.Settings.find({_id: "default"}).term || 0;
					switch(term){
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
			min: 100,
			label: "JSS1 school fees",
		},
		"schoolFees.JSS2": {
			type: Number,
			min: 100,
			label: "JSS2 school fees",
		},
		"schoolFees.JSS3": {
			type: Number,
			min: 100,
			label: "JSS3 school fees",
		},
		"schoolFees.SSS1": {
			type: Number,
			min: 100,
			label: "SSS1 school fees",
		},
		"schoolFees.SSS2": {
			type: Number,
			min: 100,
			label: "SSS2 school fees",
		},
		"schoolFees.SSS3": {
			type: Number,
			min: 1000,
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
	gender: {
		type: String,
		label: "Gender",
		allowedValues: ['Male', 'Female'],
	},
	dob: {
		type: Date,
		label: "Date of Birth",
		min: new Date(1950, 1, 1),
		max: new Date(2012, 1, 1),
		autoform: {
			type: "bootstrap-datepicker",
			datePickerOptions:{
				autoclose:true
			}
		},
		optional:true,
	},
	state:{
			type: String,
			allowedValues: g.stateArray,
			label: "State of origin",
			optional:true
		},
	town:{
			type: String,
			label: "Town",
			optional:true
		},
	homeAddress:{
			type: String,
			label: 'Home Address',
			optional:true
		},
	presentAddress:{
			type: String,
			label: "Present Address",
			optional:true
		},
	phone: {
			type: Array,
			label: 'Contact Number',
			minCount: 1,
			maxCount: 2,
			optional:true
		},
			'phone.$':{
				type: String,
				regEx: SimpleSchema.RegEx.Phone,
			},
	email: {
		type: String,
		max: 30,
		min: 5,
		regEx: SimpleSchema.RegEx.Email,
		label: "Email Address",
		optional:true
	},	
	club: {
			type: String,
			label: 'Club and Society',
			allowedValues: g.clubArray,
			optional:true
		},
	hobby: {
			type: Array,
			label: 'Hobbies',
			minCount: 1,
			maxCount: 5,
			optional:true
		},
			'hobby.$':{
			type: String,
			},
	medicalHistory:{
			type:Object,
			label: "Medical History",
			optional: true,
		},
			'medicalHistory.bloodGroup':{
				type: String,
				allowedValues: g.bloodGroupArray,
				optional:true,
				label: "Blood Group",
			},
			'medicalHistory.genotype':{
				type: String,
				allowedValues: g.genotypeArray,
				optional:true,
				label: "Genotype",
			},
			'medicalHistory.medicalCondition':{
				type: Array,
				optional: true,
				label: "Known medical condition",
			},
				'medicalHistory.medicalCondition.$':{
					type: String,
					allowedValues: g.medicalConditionArray,
				},
	nok:{
			type: Object,
			label: "Next of Kin",
			optional: true,
		},
			'nok.name':{
				type: String,
				label: "Name",
				max: 40,
				min: 3,
				optional: true,
				regEx: /[a-zA-Z-]/g
			},
			'nok.address': {
				type: String,
				label: 'Address',
				min: 5,
				optional: true,
			},
			'nok.phone': {
				type: Array,
				label: 'Mobile',
				optional: true,
				minCount: 1,
				maxCount: 2,
			},
			'nok.phone.$':{
				type: String,
				regEx: SimpleSchema.RegEx.Phone,
			},
			'nok.relationship': {
			type: String,
			label: "Relationship of NOK",
			optional: true,
			regEx: /^[a-zA-Z-]/
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
			if(this.isInsert){
				return Meteor.userId();
			}	
		},
		autoform: {
			type: 'hidden',
		},
	}
}, {tracker: Tracker});
//Student schema
g.Schemas.Student = new SimpleSchema({
		currentClass:{
			type: String,
			label: "Class",
			allowedValues: g.classArray,
		},
		studentId:{
			type: String,
			label: "Student ID / Username",
			min: 4,
			max: 15,
			regEx: /^[a-z0-9A-Z_]/
		},
		meteorIdInStudent:{
			type: String,
			optional: true,
			autoform:{
				type: 'hidden',
			}
		},
		parentOrGuardian:{
			type: Object,
			label: "Parent or Guardian",
		},
			'parentOrGuardian.name':{
				type: String,
				label: "Name",
				max: 40,
				min: 3,
				regEx: /[a-zA-Z-]/g
			},
			'parentOrGuardian.address': {
				type: String,
				label: 'Address',
				min: 5,
				optional:true,
			},
			'parentOrGuardian.phone': {
				type: Array,
				label: 'Mobile Number',
				minCount: 1,
				maxCount: 2,
			},
			'parentOrGuardian.phone.$':{
				type: String,
				regEx: SimpleSchema.RegEx.Phone,
			},
}, {tracker: Tracker});
//schema for update student info
g.Schemas.UpdateStudent = g.Schemas.Profile.omit("firstName","lastName","otherName","email","gender","createdAt","addedBy");
//schema for edit student info
g.Schemas.EditStudent = new SimpleSchema({
		currentClass:{
			type: String,
			label: "Current Class",
			allowedValues: g.classArray,
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
		gender: {
			type: String,
			label: "Gender",
			allowedValues: ['Male', 'Female'],
		},
		parentOrGuardian:{
			type: Object,
			label: "Parent or Guardian",
		},
			'parentOrGuardian.name':{
				type: String,
				label: "Name",
				max: 40,
				min: 3,
				regEx: /[a-zA-Z-]/g
			},
			'parentOrGuardian.address': {
				type: String,
				label: 'Address',
				min: 5,
				optional:true,
			},
			'parentOrGuardian.phone': {
				type: Array,
				label: 'Mobile Number',
				minCount: 1,
				maxCount: 2,
			},
			'parentOrGuardian.phone.$':{
				type: String,
				regEx: SimpleSchema.RegEx.Phone,
			},
}, {tracker: Tracker});
g.Schemas.Student.extend(g.Schemas.Profile);
g.Students.attachSchema(g.Schemas.Student);
// end student schema
//Staff schema
g.Schemas.Staff = new SimpleSchema({
		staffId: {
			type: String,
			label: "Staff ID / Username",
			min: 4,
			max: 15,
			regEx: /^[a-z0-9A-Z_]/
		},
		subjectTaught: {
			type: Array,
			maxCount: 10,
			minCount: 1,
			label: "Subject(s) Taught",
			optional:true,
		},
			"subjectTaught.$":{
				type: String,
			},
		meteorIdInStaff:{
				type: String,
				optional: true,
				autoform:{
					type: 'hidden',
				}
		},
	}, {tracker: Tracker});
//update and edit staff schema
g.Schemas.UpdateStaff =  g.Schemas.Profile.omit("firstName","lastName","otherName","email","gender","createdAt","addedBy");
//schema for edit staff info
g.Schemas.EditStaff = new SimpleSchema({
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
		gender: {
			type: String,
			label: "Gender",
			allowedValues: ['Male', 'Female'],
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
			optional:true,
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
		currentClass:{
			type: String,
			label: "Current Class",
			allowedValues: g.classArray,
		},
		graduated:{
			type:Boolean,
			optional:true,
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
//create schema dynamically;
let resultSchema = {};
g.subjectArray.forEach(function(subject){
	resultSchema[`${subject}`] = {type:Object};
	resultSchema[`${subject}.ca`] = {type:Number,min:0,label:"CA",defaultValue:0};
	resultSchema[`${subject}.exam`] = {type:Number,min:0,label:"Exam",defaultValue:0,optional:true};
});
g.Schemas.ResultArray = new SimpleSchema(resultSchema,{tracker: Tracker});
//end dealing with results schema
//payment schema
g.Schemas.PaymentArray = new SimpleSchema({
	class:{
		type: String,
		allowedValues: g.classArray,
	},
	term: {
		type: Number,
		allowedValues: g.termArray,
	},
	category: {
		type: String,
		allowedValues: ["schoolFees", "Accommodation"],
	},
	transactionId: {
		type: String,
		min: 10,
	},
	amount: {
		type: Number,
		min: 100,
	},
	//these only valid for online card payment
	approvedAmount:{
		type:Number,
		optional:true,
	},
	paymentDescription:{
		type:String,
		optional:true,
	},
	payRef:{
		type:String,
		optional:true
	},
	//end online card payment fields
	paymentStatus: {
		type: String,
		allowedValues: ["Paid", "Not paid"],
	},
	paymentType:{
		type: String,
		allowedValues: ["Online", "Cash"]
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
			optional:true,
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
		currentClass:{
			type: String,
			label: "Current Class",
			allowedValues: g.classArray,
		},
		graduated:{
			type:Boolean,
			optional:true,
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
			min: 5,
			max: 200,
			label: "Title of Assignment",
		},
		content: {
			type: String,
			min: 10,
			label: "Assignment content",
			autoform: {
				rows: 5,
			},
		},
		class: {
			type: String,
			allowedValues: g.classArray,
		},
		subject: {
			type: String,
			allowedValues: g.subjectArray,
		},
		totalScore: {
			type: Number,
			min: 0,
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
				datePickerOptions:{
					autoclose:true,
				}
			},
			min: new Date(),
		},
		session:{
			type:String,
			autoform:{
				type:'hidden'
			},
			optional:true
		},
		term:{
			type:Number,
			autoform:{
				type:'hidden'
			},
			optional:true
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
		senderId:{
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
		toClass:{
			type: Array,
			minCount: 1,
			optional:true,
		},
			'toClass.$':{
				type: String,
			},
		toStaff:{
			type: Array,
			minCount: 1,
			optional:true,
		},
			'toStaff.$':{
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
		subject:{
			type: String,
			label: 'Subject of the message',
			min: 5,
			max: 200,
		},
		content:{
			type: String,
			min: 10,
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
		readBy:{
			type: Array,
			autoform:{
				type: 'hidden',
			},
		},
			'readBy.$':{
				type: String,
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

g.Schemas.Subject = new SimpleSchema({
	subjects:{
		type:Array,
		optional:true,
	},
		"subject.$":{
			type:String,
		},
	category:{
		type:Object,
		optional:true,
		blackbox:true,
	},
		"category.$":{
			type:Array,
		}
})