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
.controller('loginCtrl', function LoginController ($scope, $http, $state, store) {

	$scope.user = {};

	$scope.login = function() {
		$http({

			url: 'http://localhost:3000/sessions/create',
			data: $scope.user,
			method: 'POST'

		}).then(function(response) {

			store.set('jwt', response.data.id_token);
			$state.go('home');

		}, function() {
			alert(response.data);
		});
	};



});