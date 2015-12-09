
angular.module('broadcastApp', [

	'signup',
	'admin_signup',
	'login',
	'forgot-password',
	'main',
	'my-lists',
	'broadcasts',
	'custom-responses',
	'broadcastApp.admin.defaultResponses',
	'angular-jwt',
	'angular-storage'

])
.config( function broadcastAppConfig ($urlRouterProvider, jwtInterceptorProvider, $httpProvider){

	$urlRouterProvider.otherwise('/');

	jwtInterceptorProvider.tokenGetter = function(store) {
	    return store.get('jwt');
	};

	$httpProvider.interceptors.push('jwtInterceptor');

})
.run( function($rootScope, $state, store, jwtHelper) {
	$rootScope.authenticated = false;
	$rootScope.current_user = '';
	$rootScope.role = false;

	$rootScope.$on('$stateChangeStart', function(e, to) {

		if (to.data) {

			if (to.data.requiresLogin || to.data.requiresAdmin) {

				if (!store.get('jwt') || jwtHelper.isTokenExpired(store.get('jwt'))) {

					e.preventDefault();
					$state.go('login');

				}
				else {
					
					var current_user = jwtHelper.decodeToken(store.get('jwt'));
					if (to.data.requiresAdmin && current_user.role !== 'admin') {

						e.preventDefault();
						$state.go('main');

					}
					else {

						$rootScope.authenticated = true;
						$rootScope.current_user = current_user.email;
						$rootScope.role = current_user.role;
					
					}
					

				}
			}
		}
			

	});

	$rootScope.signout = function() {

		store.remove('jwt');

		$rootScope.authenticated = false;
		$rootScope.current_user = '';

	};

});
/*
.controller( 'AppCtrl', function AppCtrl ($scope, $location) {

	$scope.$on()

});
*/