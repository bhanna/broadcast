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

			if (!data.errors) {
				$scope.sent = true;
			}
			else {
				$scope.errors = true;
			}
			

		}, function(err) {

			if (err) console.log(err);
			$scope.response = 'Sorry... there was an error.  Please try again.';

		});
	};

	$scope.init();



});