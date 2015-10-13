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
	$scope.broadcast = {};

	$scope.broadcast = function () {

		$http.post('/broadcast/', $scope.broadcast).success(function(data){

			$scope.broadcast = {header: '', body: '', to: ''};
			$scope.broadcast_sent = 'Sent to: ' + data.to;

		});

	};

});