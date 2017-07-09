
//User rules
Meteor.users.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,

});

Meteor.users.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});
//Staff rules
g.Staffs.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,

});

g.Staffs.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});


//Student rules
g.Students.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,

});

g.Students.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});

//payment rules
g.Payments.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,

});

g.Payments.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});

//result rules
g.Results.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,

});

g.Results.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});

//Assignment rules
g.Assignments.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,

});

g.Assignments.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});


//messages rules

g.Messages.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,

});

g.Messages.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});

//feedback rules
g.Feedbacks.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,

});

g.Feedbacks.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});

//settings rules
g.Settings.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,

});

g.Settings.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});