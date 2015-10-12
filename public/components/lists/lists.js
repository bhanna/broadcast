angular.module('lists', [
		'ngResource', 
		'ui.router',
		'angular-storage'
	])
.config(function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('lists', {
			url: '/lists',
			controller: 'listCtrl',
			templateUrl: 'components/lists/lists.html'
	});

})
.factory('getLists', function($resource){

	return $resource('/lists/:id');

})
.factory('getListRecipients', function($resource){

	return $resource('/lists/:id/recipients/:id');

})
.controller('listCtrl', function ListController ($scope, $http, $location, getLists, getListRecipients) {

	$scope.username = 'Matthew';
	//$scope.listRecipients = getListRecipients.query();

	$scope.recipient = {};

	$scope.postRecipient = function () {

		$http.post('/recipients/single', $scope.recipient).success(function(data){

			$scope.recipient_message = data.message;
			$scope.listRecipients = getListRecipients.query();

		});

	};

});