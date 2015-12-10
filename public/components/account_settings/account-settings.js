angular.module('account-settings', [
	'ui.router',
])
.config(function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('account-settings', {
			url: '/account-settings',
			controller: 'updatePasswordCtrl',
			templateUrl: 'components/account_settings/account-settings.html',
			data: {
				requiresLogin: true
			}
	});

})
//TODO turn this all into Account settings
//TODO add custom directives for validation and check $error object...
.controller('updatePasswordCtrl', function UpdatePasswordCtrl ($scope, $state, $http) {

	$scope.init = function() {

		$scope.user = {};

	};
	


	$scope.updatePassword = function() {

		$http({

			url: '/users/update-password',
			data: $scope.user,
			method: 'POST'

		}).success(function(data) {

			$scope.response = data.message;
			console.log('data ', data);

			if (data.errors) {
				$scope.errors = true;
			}
			

		}, function(err) {

			if (err) console.log(err);
			$scope.response = 'Sorry... there was an error.  Please try again.';

		});
	};

	$scope.init();



});