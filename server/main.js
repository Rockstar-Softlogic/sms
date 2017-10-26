import { Meteor } from 'meteor/meteor';
import '../imports/admin/server/main.js';
import '../imports/student/server/main.js';
Meteor.startup(() => {
  // code to run on server at startup
  	initAdmin();
	fakeAdmin();
	initSubject();
});
function initAdmin(){
	let lookUp = Meteor.users.findOne({username:"wisdomabioye", "emails.0.address":"hakym2009@gmail.com", roles:'admin'});
	if(!lookUp){
		let admin= Accounts.createUser({username:"wisdomabioye", email:"hakym2009@gmail.com", password: "wetindey"});
		if(admin){
			Roles.addUsersToRoles(admin, ['staff','editor','admin','superAdmin']);
			g.Staffs.insert({
				"firstName":"Abdulhakeem",
				"lastName":"Abioye",
				"staffId":"wisdomabioye",
				"gender":"Male",
				"meteorIdInStaff":admin
			});
			console.log("Admin created and added to roles");
		}
	}else{
		console.log(lookUp.username,lookUp.emails[0].address, " already a ",lookUp.roles);
	}
}

function fakeAdmin(){
	let lookUp = Meteor.users.findOne({username:"admin", "emails.0.address":"admin@rssl.com", roles:'admin'});
	if(!lookUp){
		let admin = Accounts.createUser({username:"admin", email:"admin@gmail.com", password: "12345"});
		if(admin){
			Roles.addUsersToRoles(admin, ['staff','editor','admin']);
			g.Staffs.insert({
				"firstName":"Admin First Name",
				"lastName":"Admin Last Name",
				"staffId":"admin",
				"gender":"Male",
				"meteorIdInStaff":admin
			});
			console.log("Fake admin created and added to roles");
		}
	}else{
		console.log(lookUp.username,lookUp.emails[0].address, " already a ",lookUp.roles);
	}
}
function initSubject(){
	let findSubject = g.Subjects.findOne({"_id":"default"});
	if(!findSubject){
		g.Subjects.insert({"_id":"default","subjects":[],"category":{}});
		console.log("Subject collection created");
		return
	}console.log("Subject collection is existing");
}


