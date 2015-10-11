angular.module('signup', [
	'ui.router',
	'angular-storage'

])
.config(function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('signup', {
			url: '/signup',
			controller: 'signupCtrl',
			templateUrl: '/signup.html'
	});

})
.controller('signupCtrl', function SignupController ($scope, $http, store) {

	$scope.user = {};

	$scope.signup = function() {

		$http({

			url: '/auth/signup',
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