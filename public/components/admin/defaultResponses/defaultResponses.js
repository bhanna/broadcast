angular.module('broadcastApp.admin.defaultResponses', [
	'ui.router',
	'angular-storage'

])
.config(function($stateProvider) {

	$stateProvider
		.state('defaultResponses', {
			url: '/defaultResponses',
			controller: 'defaultResponsesCtrl',
			templateUrl: 'components/admin/defaultResponses/defaultResponses.html',
			data: {
				requiresLogin: true,
				requiresAdmin: true
			}
	});

})
.factory('getResponses', function($resource){

	return $resource('/admin/defaultResponses/all');

})
.controller('defaultResponsesCtrl', function DefaultResponsesController($http, $scope, getResponses) {

	$scope.init = function () {

		$scope.responses = getResponses.query();

		console.log('responses: ', $scope.responses);

	};


	$scope.saveDefaultResponse = function(response) {
		
		console.log(response);
		$http.post('/admin/defaultResponses', response).success(function(data) {

			console.log(data);

		});
	};

	$scope.init();

});