
g = this;

//student, payment, result, assignment, message, feedback collections


g.Staffs = new Mongo.Collection('staffs')
g.Students = new Mongo.Collection('students')
g.Payments = new Mongo.Collection('payments');
g.Results = new Mongo.Collection('results');
g.Assignments = new Mongo.Collection('assignments');
g.Messages = new Mongo.Collection('messages');
g.Feedbacks = new Mongo.Collection('feeback');
g.Settings = new Mongo.Collection('settings');

g.Schemas = {};

