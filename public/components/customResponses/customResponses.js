angular.module('customResponses', [
	'ui.router',
	'angular-storage'

])
.config(function($stateProvider) {

	$stateProvider
		.state('customResponses', {
			url: '/customResponses',
			controller: 'customResponsesCtrl',
			templateUrl: 'components/customResponses/customResponses.html',
			data: {
				requiresLogin: true
			}
	});

})
.factory('getCustomResponses', function($resource){

	return $resource('/api/protected/customResponses/all');

})
.controller('customResponsesCtrl', function CustomResponsesController($http, $scope, getCustomResponses) {

	$scope.init = function () {

		$scope.responses = getCustomResponses.query();

	};


	$scope.saveCustomResponse = function(response) {

		//console.log(response.body);
		$http.post('/api/protected/customResponses/', response).success(function(data) {

			console.log(data);

		});
	};

	$scope.init();

});