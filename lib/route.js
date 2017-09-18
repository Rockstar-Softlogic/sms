//using flowRouter
import { FlowRouter } from 'meteor/kadira:flow-router';
//onlogin and onlogout
if(Meteor.isClient){
		Accounts.onLogin(function(){
		if(Meteor.userId() && Roles.userIsInRole(Meteor.userId(), ['admin', 'editor', 'staff'])){
			FlowRouter.go('staffDashboard');	
		}else if(Roles.userIsInRole(Meteor.userId(), ['student'])){
			FlowRouter.go('studentLandingPage');
		}
	});
	Accounts.onLogout(function(){
		FlowRouter.go('/');
	});
}

//public routes
FlowRouter.route('/', {
	name: "login",
	action(){
		BlazeLayout.render('login');
	}
});
FlowRouter.route('/feeback', {
	name: "feedback",
	action(){
		BlazeLayout.render('feedback');
	}
});

//private routes
// check login
function checkLoggedIn(ctx, redirect){
	if(!Meteor.userId()){
		redirect('/error');
	}
}
//check student exist
function confirmResultSession(ctx, redirect){
	var result = Session.get('st.info');
		if(!result){
			redirect('/result')
		}
}
function confirmPaymentSession(ctx, redirect){
	var result = Session.get('st.info');
		if(!result){
			redirect('/payment')
		}
}
function passportUploadTarget(ctx, redirect){
	let target = Session.get("passportTarget");
		if(!target) redirect('/error');
}
////////////////////////////
//////Staff Routes /////////
/////////////////////////////
let staffRoute = FlowRouter.group({
	prefix:"/dashboard",
	name: "dashboard",
	triggersEnter:[checkLoggedIn]
});

staffRoute.route('/', {
	name: 'staffDashboard',
	action(){
		BlazeLayout.render('dashboard', {content: 'staffDashboard'});
	}
});
staffRoute.route('/search',{
	name:"generalSearch",
	action(){
		BlazeLayout.render('dashboard',{content: 'generalSearch'});
	}
});
staffRoute.route('/logs',{
	name:"logs",
	action(){
		BlazeLayout.render('dashboard',{content: 'logs'});
	}
});

staffRoute.route('/ctrlpanel', {
	name: 'ctrlpanel',
	action(){
		BlazeLayout.render('dashboard', {content: 'ctrlpanel'});
	}
});
	
staffRoute.route('/passportUploader', {
	name: 'passportUploader',
	triggersEnter: [passportUploadTarget],//check session for passport owner details
	action(){
		BlazeLayout.render('dashboard', {content: 'passportUpload'});
	}
});
staffRoute.route('/staff', {
	name: 'staffList',
	action(){
		BlazeLayout.render('dashboard', {content: 'staffList'});
	}
});
staffRoute.route('/editor', {
	name: 'editorList',
	action(){
		BlazeLayout.render('dashboard', {content: 'editorList'});
	}
});

staffRoute.route('/admin', {
	name: 'adminList',
	action(){
		BlazeLayout.render('dashboard', {content: 'adminList'});
	}
});
staffRoute.route('/staff/view/:id', {
	name: 'singleStaff',
	action(){
		BlazeLayout.render('dashboard', {content: 'singleStaff'});
	}
});
staffRoute.route('/staff/new', {
	name: 'newStaff',
	action(){
		BlazeLayout.render('dashboard', {content: 'newStaff'});
	}
});

staffRoute.route('/staff/edit/:id', {
	name: 'editStaff',
	action(){
		BlazeLayout.render('dashboard', {content: 'editStaff'});
	}
});

staffRoute.route('/staff/update/:id', {
	name: 'updateStaff',
	action(){
		BlazeLayout.render('dashboard', {content: 'updateStaff'});
	}
});
staffRoute.route('/student', {
	name: 'studentList',
	action(){
		BlazeLayout.render('dashboard', {content: 'studentList'});
	}
});
staffRoute.route('/student/graduated', {
	name: 'graduatedStudents',
	action(){
		BlazeLayout.render('dashboard', {content: 'graduatedStudents'});
	}
});
staffRoute.route('/student/graduated/:id', {
	name: 'singleGraduatedStudent',
	action(){
		BlazeLayout.render('dashboard', {content: 'singleGraduatedStudent'});
	}
});
staffRoute.route('/student/view/:id', {
	name: 'singleStudent',
	action(){
		BlazeLayout.render('dashboard', {content: 'singleStudent'});
	}
});
staffRoute.route('/student/new', {
	name: 'newStudent',
	action(){
		BlazeLayout.render('dashboard', {content: 'newStudent'});
	}
});
staffRoute.route('/student/edit/:id', {
	name: 'editStudent',
	action(){
		BlazeLayout.render('dashboard', {content: 'editStudent'});
	}
});
staffRoute.route('/student/update/:id', {
	name: 'updateStudent',
	action(){
		BlazeLayout.render('dashboard', {content: 'updateStudent'});
	}
});

staffRoute.route('/result', {
	name: 'resultList',
	action(){
		BlazeLayout.render('dashboard', {content: 'resultList'});
	}
});
staffRoute.route('/result/view/:id', {
	name: 'singleResult',
	action(){
		BlazeLayout.render('dashboard', {content: 'singleResult'});
	}
});

staffRoute.route('/result/new', {
	triggersEnter: [confirmResultSession],
	name: 'updateResult',
	action(){
		BlazeLayout.render('dashboard', {content: 'updateResult'});
	}
});
staffRoute.route('/result/edit/:id', {
	name: 'editResult',
	action(){
		BlazeLayout.render('dashboard', {content: 'editResult'});
	}
});

staffRoute.route('/payment', {
	name: 'paymentList',
	action(){
		BlazeLayout.render('dashboard', {content: 'paymentList'});
	}
});
staffRoute.route('/payment/view/:id', {
	name: 'singlePayment',
	action(){
		BlazeLayout.render('dashboard', {content: 'singlePayment'});
	}
});
staffRoute.route('/payment/new', {
	triggersEnter: [confirmPaymentSession],
	name: 'updatePayment',
	action(){
		BlazeLayout.render('dashboard', {content: 'updatePayment'});
	}
});
staffRoute.route('/payment/edit/:id', {
	name: 'editPayment',
	action(){
		BlazeLayout.render('dashboard', {content: 'editPayment'});
	}
});

staffRoute.route('/assignment', {
	name: 'assignmentList',
	action(){
		BlazeLayout.render('dashboard', {content: 'assignmentList'});
	}
});
staffRoute.route('/assignment/view/:id', {
	name: 'singleAssignment',
	action(){
		BlazeLayout.render('dashboard', {content: 'singleAssignment'});
	}
});
staffRoute.route('/assignment/new', {
	name: 'newAssignment',
	action(){
		BlazeLayout.render('dashboard', {content: 'newAssignment'});
	}
});
staffRoute.route('/assignment/edit/:id', {
	name: 'editAssignment',
	action(){
		BlazeLayout.render('dashboard', {content: 'editAssignment'});
	}
});
staffRoute.route('/message', {
	name: 'message',
	action(){
		BlazeLayout.render('dashboard', {content: 'messages'});
	}
});
staffRoute.route('/message/:id', {
	name: 'singleMessage',
	action(){
		BlazeLayout.render('dashboard', {content: 'singleMessage'});
	}
});
staffRoute.route('/message/new', {
	name: 'newMessage',
	action(){
		BlazeLayout.render('dashboard', {content: 'newMessage'});
	}
});
staffRoute.route('/profile', {
	name: 'profile',
	action(){
		BlazeLayout.render('dashboard', {content: 'profile'});
	}
});
staffRoute.route('/profile/edit', {
	name: 'editProfile',
	action(){
		BlazeLayout.render('dashboard', {content: 'editProfile'});
	}
});
staffRoute.route('/sms',{
	name:'sms',
	action(){
		BlazeLayout.render('dashboard',{content:'sms'})
	}
});
staffRoute.route('/sms/new',{
	name:'newSms',
	action(){
		BlazeLayout.render('dashboard',{content:'newSms'})
	}
});

staffRoute.route('/performance',{
	name:'performance',
	action(){
		BlazeLayout.render('dashboard',{content:'performance'})
	}
});
staffRoute.route('/performance/:id',{
	name:'studentPerformance',
	action(){
		BlazeLayout.render('dashboard',{content:'studentPerformance'})
	}
});
////////////////////////////////
// **********************///////
// **********************///////
// ***Student routes***/////////
// **********************///////
// **********************///////
////////////////////////////////
let studentRoute = FlowRouter.group({
	prefix:"/st/dashboard",
	name: "studentDashboard",
	triggersEnter:[checkLoggedIn]
});
studentRoute.route('/', {
	name: 'studentLandingPage',
	action(){
		BlazeLayout.render('stDashboard', {stContent: 'studentLandingPage'});
	}
});
studentRoute.route('/profile', {
	name: 'studentProfile',
	action(){
		BlazeLayout.render('stDashboard', {stContent: 'studentProfile'});
	}
});
studentRoute.route('/profile/edit', {
	name: 'editStProfile',
	action(){
		BlazeLayout.render('stDashboard', {stContent: 'editStProfile'});
	}
});
studentRoute.route('/result', {
	name: 'stResult',
	action(){
		BlazeLayout.render('stDashboard', {stContent: 'stResult'});
	}
});
studentRoute.route('/payment', {
	name: 'stPayment',
	action(){
		BlazeLayout.render('stDashboard', {stContent: 'stPayment'});
	}
});
studentRoute.route('/assignment', {
	name: 'stAssignment',
	action(){
		BlazeLayout.render('stDashboard', {stContent: 'stAssignment'});
	}
});
studentRoute.route('/assignment/view/:id', {
	name: 'stSingleAssignment',
	action(){
		BlazeLayout.render('stDashboard', {stContent: 'stSingleAssignment'});
	}
});
studentRoute.route('/message', {
	name: 'stMessage',
	action(){
		BlazeLayout.render('stDashboard', {stContent: 'stMessage'});
	}
});
studentRoute.route('/logs', {
	name: 'stLogs',
	action(){
		BlazeLayout.render('stDashboard', {stContent: 'stLogs'});
	}
});
// **********************///
// **********************///
// ******BREAK Break******///
// **********************///
// **********************///
//error 404!, not found
FlowRouter.notFound = ({
	action(){
		BlazeLayout.render('notFound');
	}
});