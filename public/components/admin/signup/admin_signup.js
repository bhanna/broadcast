angular.module('admin_signup', [
	'ui.router',
	'angular-storage'

])
.config(function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('admin_signup', {
			url: '/admin_signup',
			controller: 'adminSignupCtrl',
			templateUrl: 'components/admin/signup/admin_signup.html'
	});

})
.controller('adminSignupCtrl', function AdminSignupController ($scope, $state, $http, store) {

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