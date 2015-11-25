
angular.module('broadcastApp', [

	'signup',
	'admin_signup',
	'login',
	'main',
	'my-lists',
	'broadcasts',
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

	$rootScope.$on('$stateChangeStart', function(e, to) {

		if (to.data && to.data.requiresLogin) {

			if (!store.get('jwt') || jwtHelper.isTokenExpired(store.get('jwt'))) {

				e.preventDefault();
				$state.go('login');

			}
			else {
				$rootScope.authenticated = true;
				var current_user = jwtHelper.decodeToken(store.get('jwt'));
				$rootScope.current_user = current_user.username;
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