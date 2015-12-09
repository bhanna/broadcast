angular.module('forgot-password', [
	'ui.router',
])
.config(function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('forgot-password', {
			url: '/forgot-password',
			controller: 'forgotPasswordCtrl',
			templateUrl: 'components/forgot_password/forgot-password.html'
	});

})
.controller('forgotPasswordCtrl', function ForgotPasswordCtrl ($scope, $state, $http) {

	$scope.init = function() {

		$scope.user = {};
		$scope.sent = null;

	};
	

	$scope.forgotPassword = function() {

		$http({

			url: '/users/forgot-password',
			data: $scope.user,
			method: 'POST'

		}).success(function(data) {

			$scope.response = data.message;
			console.log('data ', data);
			$scope.sent = true;
			//TODO add a class to response <p> if error
			//hide the input once the password is reset correctly

		}, function(err) {

			if (err) console.log(err);
			$scope.response = 'Sorry... there was an error.  Please try again.';

		});
	};

	$scope.init();



});