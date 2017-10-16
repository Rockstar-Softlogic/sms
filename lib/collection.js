g = this;
g.Tether = {};//for bootstrap
g.Staffs = new Mongo.Collection('staffs');
g.Students = new Mongo.Collection('students');
g.Graduates = new Mongo.Collection('graduates');
g.Payments = new Mongo.Collection('payments');
g.Results = new Mongo.Collection('results');
g.Assignments = new Mongo.Collection('assignments');
g.Subjects = new Mongo.Collection('subjects');
g.Messages = new Mongo.Collection('messages');
g.SMS = new Mongo.Collection('sms');
g.Feedbacks = new Mongo.Collection('feeback');
g.Settings = new Mongo.Collection('settings');
g.Logs = new Mongo.Collection('logs');
g.Schemas = {};

if(Meteor.isClient){
	Tracker.autorun(function(){
		Meteor.subscribe("subject.list");
		Meteor.subscribe("setting");
	});
};