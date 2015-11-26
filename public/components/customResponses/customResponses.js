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
.factory('getResponses', function($resource){

	return $resource('/api/protected/customResponses/all');

})
.controller('customResponsesCtrl', function CustomResponsesController($http, $scope, getResponses) {

	$scope.init = function () {

		$scope.responses = getResponses.query();

	};


	$scope.saveCustomResponse = function(response) {

		//console.log(response.body);
		$http.put('/api/protected/customResponses/' + response._id, response).success(function(data) {

			console.log(data);

		});
	};

	$scope.init();

});