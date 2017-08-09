//using flowRouter
import { FlowRouter } from 'meteor/kadira:flow-router';
import '../imports/public/lib/route.js'; //import public routes


//
if(Meteor.isClient){
		Accounts.onLogin(function(){
		if(Meteor.userId() && Roles.userIsInRole(Meteor.userId(), ['admin', 'editor', 'staff'])){
			FlowRouter.go('/dashboard');	
		}else if(Roles.userIsInRole(Meteor.userId(), ['student'])){
			FlowRouter.go('/st/dashboard');
		}
	});

	Accounts.onLogout(function(){
		FlowRouter.go('/');
	});
}

//private routes
// check login
function checkLoggedIn(ctx, redirect){
	if(!Meteor.userId()){
		redirect('/error');
	}
}

function checkAdmin(ctx, redirect){
	if(Meteor.isClient){
		if(!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), ['admin'])){
			redirect('/error');
		}
	}
}

function checkEditor(ctx, redirect){
	if(!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), ['admin', 'editor'])){
		redirect('/error');
	}
}

function checkStaff(ctx, redirect){
	if(!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), ['admin', 'editor', 'staff'])){
		redirect('/error');
	}
}
function checkStudent(ctx, redirect){
	if(!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), ['student'])){
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

FlowRouter.route('/dashboard', {
	name: 'staffDashboard',
	triggersEnter: [checkLoggedIn],
	action(){
		BlazeLayout.render('dashboard', {content: 'staffDashboard'});
	}
});

FlowRouter.route('/ctrlpanel', {
	name: 'ctrlpanel',
	triggersEnter: [checkLoggedIn],
	action(){
		BlazeLayout.render('dashboard', {content: 'ctrlpanel'});
	}
});

// **********************///
// **********************///
// ******BREAK Break******///
// **********************///
// **********************///
function passportUploadTarget(ctx, redirect){
		let target = Session.get("passportTarget");
			if(!target) redirect('/error');
	}
	
FlowRouter.route('/passportUploader', {
	name: 'passportUploader',
	triggersEnter: [passportUploadTarget],
	action(){
		BlazeLayout.render('dashboard', {content: 'passportUpload'});
	}
});

// **********************///
// **********************///
// ******BREAK Break******///
// **********************///
// **********************///

FlowRouter.route('/staff', {
	name: 'staffList',
	action(){
		BlazeLayout.render('dashboard', {content: 'staffList'});
	}
});
FlowRouter.route('/editor', {
	name: 'editorList',
	action(){
		BlazeLayout.render('dashboard', {content: 'editorList'});
	}
});

FlowRouter.route('/staff/view/:id', {
	name: 'singleStaff',
	action(){
		BlazeLayout.render('dashboard', {content: 'singleStaff'});
	}
});

FlowRouter.route('/staff/new', {
	name: 'insertStaff',
	action(){
		BlazeLayout.render('dashboard', {content: 'insertStaff'});
	}
});

FlowRouter.route('/staff/edit/:id', {
	name: 'editStaff',
	action(){
		BlazeLayout.render('dashboard', {content: 'editStaff'});
	}
});

FlowRouter.route('/staff/update/:id', {
	name: 'updateStaff',
	action(){
		BlazeLayout.render('dashboard', {content: 'updateStaff'});
	}
});
// **********************///
// **********************///
// ******BREAK Break******///
// **********************///
// **********************///

FlowRouter.route('/student', {
	name: 'studentList',
	action(){
		BlazeLayout.render('dashboard', {content: 'studentList'});
	}
});

FlowRouter.route('/student/view/:id', {
	name: 'singleStudent',
	action(){
		BlazeLayout.render('dashboard', {content: 'singleStudent'});
	}
});

FlowRouter.route('/student/new', {
	name: 'insertStudent',
	action(){
		BlazeLayout.render('dashboard', {content: 'insertStudent'});
	}
});
FlowRouter.route('/student/edit/:id', {
	name: 'editStudent',
	action(){
		BlazeLayout.render('dashboard', {content: 'editStudent'});
	}
});
FlowRouter.route('/student/update/:id', {
	name: 'updateStudent',
	action(){
		BlazeLayout.render('dashboard', {content: 'updateStudent'});
	}
});


// **********************///
// **********************///
// ******BREAK Break******///
// **********************///
// **********************///
FlowRouter.route('/result', {
	name: 'resultList',
	action(){
		BlazeLayout.render('dashboard', {content: 'resultList'});
	}
});
FlowRouter.route('/result/view/:id', {
	name: 'singleResult',
	action(){
		BlazeLayout.render('dashboard', {content: 'singleResult'});
	}
});

FlowRouter.route('/result/new', {
	triggersEnter: [confirmResultSession],
	name: 'updateResult',
	action(){
		BlazeLayout.render('dashboard', {content: 'updateResult'});
	}
});

FlowRouter.route('/result/edit/:id', {
	name: 'editResult',
	action(){
		BlazeLayout.render('dashboard', {content: 'editResult'});
	}
});


// **********************///
// **********************///
// ******BREAK Break******///
// **********************///
// **********************///

FlowRouter.route('/payment', {
	name: 'paymentList',
	action(){
		BlazeLayout.render('dashboard', {content: 'paymentList'});
	}
});

FlowRouter.route('/payment/view/:id', {
	name: 'singlePayment',
	action(){
		BlazeLayout.render('dashboard', {content: 'singlePayment'});
	}
});

FlowRouter.route('/payment/new', {
	triggersEnter: [confirmPaymentSession],
	name: 'updatePayment',
	action(){
		BlazeLayout.render('dashboard', {content: 'updatePayment'});
	}
});
FlowRouter.route('/payment/edit/:id', {
	name: 'editPayment',
	action(){
		BlazeLayout.render('dashboard', {content: 'editPayment'});
	}
});

// **********************///
// **********************///
// ******BREAK Break******///
// **********************///
// **********************///


FlowRouter.route('/assignment', {
	name: 'assignmentList',
	action(){
		BlazeLayout.render('dashboard', {content: 'assignmentList'});
	}
});
FlowRouter.route('/assignment/view/:id', {
	name: 'singleAssignment',
	action(){
		BlazeLayout.render('dashboard', {content: 'singleAssignment'});
	}
});
FlowRouter.route('/assignment/new', {
	name: 'createAssignment',
	action(){
		BlazeLayout.render('dashboard', {content: 'createAssignment'});
	}
});
FlowRouter.route('/assignment/edit/:id', {
	name: 'editAssignment',
	action(){
		BlazeLayout.render('dashboard', {content: 'editAssignment'});
	}
});
// **********************///
// **********************///
// ******BREAK Break******///
// **********************///
// **********************///
FlowRouter.route('/message', {
	name: 'messageList',
	action(){
		BlazeLayout.render('dashboard', {content: 'messages'});
	}
});
FlowRouter.route('/message/:id', {
	name: 'singleMessage',
	action(){
		BlazeLayout.render('dashboard', {content: 'singleMessage'});
	}
});
FlowRouter.route('/message/new', {
	name: 'createMessage',
	action(){
		BlazeLayout.render('dashboard', {content: 'createMessage'});
	}
});
// **********************///
// **********************///
// ******BREAK Break******///
// **********************///
// **********************///
FlowRouter.route('/profile', {
	name: 'profile',
	action(){
		BlazeLayout.render('dashboard', {content: 'profile'});
	}
});

FlowRouter.route('/profile/edit', {
	name: 'editProfile',
	action(){
		BlazeLayout.render('dashboard', {content: 'editProfile'});
	}
});


// **********************///
// **********************///
// ******BREAK Break******///
// **********************///
// **********************///

FlowRouter.route('/feedback', {
	name: 'createFeedback',
	action(){
		BlazeLayout.render('dashboard', {content: 'createFeedback'});
	}
});
FlowRouter.route('/feedback/:id', {
	name: 'singleFeedback',
	action(){
		BlazeLayout.render('dashboard', {content: 'singleFeedback'});
	}
});
FlowRouter.route('/feedbackList', {
	name: 'feedbackList',
	action(){
		BlazeLayout.render('dashboard', {content: 'feedbackList'});
	}
});
////////////////////////////////////////////////////////////////////
// **********************///
// **********************///
// ******Student routes******///
// **********************///
// **********************///
/////////////////////////////////////////////////////////////////////

FlowRouter.route('/st/dashboard', {
	name: 'stDashboard',
	triggersEnter: [checkLoggedIn],
	action(){
		BlazeLayout.render('stDashboard', {content: 'studentProfile'});
	}
});

FlowRouter.route('/st/profile/edit', {
	name: 'editStProfile',
	action(){
		BlazeLayout.render('stDashboard', {content: 'editStProfile'});
	}
});

FlowRouter.route('/st/result', {
	name: 'stResult',
	action(){
		BlazeLayout.render('stDashboard', {content: 'stResult'});
	}
});

FlowRouter.route('/st/payment', {
	name: 'stPayment',
	action(){
		BlazeLayout.render('stDashboard', {content: 'stPayment'});
	}
});

FlowRouter.route('/st/assignment', {
	name: 'stAssignment',
	action(){
		BlazeLayout.render('stDashboard', {content: 'stAssignment'});
	}
});

FlowRouter.route('/st/assignment/view/:id', {
	name: 'stSingleAssignment',
	action(){
		BlazeLayout.render('stDashboard', {content: 'stSingleAssignment'});
	}
});

FlowRouter.route('/st/message', {
	name: 'stMessage',
	action(){
		BlazeLayout.render('stDashboard', {content: 'stMessage'});
	}
});

FlowRouter.route('/st/feedback', {
	name: 'stFeedback',
	action(){
		BlazeLayout.render('stDashboard', {content: 'stFeedback'});
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