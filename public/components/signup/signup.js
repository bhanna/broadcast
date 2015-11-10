angular.module('signup', [
	'ui.router',
	'angular-storage'

])
.config(function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('signup', {
			url: '/signup',
			controller: 'signupCtrl',
			templateUrl: 'components/signup/signup.html'
	});

})
.controller('signupCtrl', function SignupController ($scope, $state, $http, store) {

	$scope.user = {};

	$scope.signup = function() {

		$http({

			url: '/users',
			data: $scope.user,
			method: 'POST'

		}).then(function(response) {

			store.set('jwt', response.data.id_token);
			$state.go('main');

		}, function(error) {
			alert(error.data);
		});
	};



});