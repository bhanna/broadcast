angular.module('login', [
	'ui.router',
	'angular-storage'

])
.config(function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('login', {
			url: '/login',
			controller: 'loginCtrl',
			templateUrl: 'components/login/login.html'
	});

})
.controller('loginCtrl', function LoginController ($rootScope, $scope, $http, $state, store) {

	$scope.user = {};

	$scope.login = function() {
		$http({

			url: 'users/sessions/create',
			data: $scope.user,
			method: 'POST'

		}).then(function(response) {

			store.set('jwt', response.data.id_token);
			$rootScope.current_user = response.data.username;
			$state.go('main');

		}, function(error) {
			alert(error.data);
		});
	};



});