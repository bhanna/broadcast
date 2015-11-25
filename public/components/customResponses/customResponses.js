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

	return $resource('/api/protected/responses/');

})
.controller('customResponsesCtrl', function CustomResponsesController($http, $scope) {

	$scope.init = function () {

		//$scope.responses = getResponses.query();

	};


	$scope.saveCustomResponses = function(responses) {



	};

	$scope.init();

});