angular.module('custom-responses', [
	'ui.router',
	'angular-storage'

])
.config(function($stateProvider) {

	$stateProvider
		.state('custom-responses', {
			url: '/custom-responses',
			controller: 'customResponsesCtrl',
			templateUrl: 'components/custom_responses/custom-responses.html',
			data: {
				requiresLogin: true
			}
	});

})
.factory('getCustomResponses', function($resource){

	//TODO change this route to custom-responses
	return $resource('/api/protected/customResponses/all');

})
.controller('customResponsesCtrl', function CustomResponsesController($http, $scope, getCustomResponses) {

	$scope.init = function () {

		$scope.responses = getCustomResponses.query();

	};


	$scope.saveCustomResponse = function(response) {

		//console.log(response.body);
		//TODO change this route to custom-responses
		$http.post('/api/protected/customResponses/', response).success(function(data) {

			console.log(data);

		});
	};

	$scope.init();

});