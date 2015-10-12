angular.module('broadcasts', [
	'ui.router',
	'angular-storage'

])
.config(function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('broadcasts', {
			url: '/broadcasts',
			controller: 'broadcastsCtrl',
			templateUrl: 'components/broadcasts/broadcasts.html'
	});

})
.controller('broadcastsCtrl', function BroadcastsController ($scope, $http, $state) {

	$scope.username = 'Matthew';
	$scope.message = {};

	$scope.postMessage = function () {

		$http.post('/messages/', $scope.message).success(function(data){

			$scope.message = {title: '', body: '', to: ''};
			$scope.message_sent = 'Sent to: ' + data.to;

		});

	};

});