//public routes

//triggersEnters
function checkRole(ctx, redirect){
	// recondsider..... to be fixed
	if(Roles.userIsInRole(this.userId, ['admin', 'editor', 'staff'])){
			redirect('/dashboard');
		}
	else if(Roles.userIsInRole(this.userId, ['student'])){
				redirect('/st/dashboard');
			}
}

FlowRouter.route('/', {
	name: 'index',
	action(){
		BlazeLayout.render('publicLayout', {public: 'login'});
	}
});
FlowRouter.route('/contact', {
	name: 'home',
	action(){
		BlazeLayout.render('publicLayout', {public: 'contact'});
	}
});


FlowRouter.route('/login', {
	name: 'login',
	action(){
		BlazeLayout.render('publicLayout', {public: 'login'});
	}
});
