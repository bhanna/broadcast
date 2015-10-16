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

	$scope.sendBroadcast = function () {

		//TODO make this cleaner
		//TODO add Sender from User account
		if ($scope.broadcast.numPositions != '1') {

			$scope.broadcast.body = 'There are ' + $scope.broadcast.numPositions + ' job openings at ' + 
			$scope.broadcast.location + '.  The job lasts from ' + $scope.broadcast.time + ', on ' + 
			$scope.broadcast.date + '.  The pay is ' + $scope.broadcast.pay + '. Are you available?  Please text "yes" or "no"';

		}
		else {

			$scope.broadcast.body = 'There is 1 job opening to fill at ' + 
			$scope.broadcast.location + '.  The job lasts from ' + $scope.broadcast.time + ', on ' + 
			$scope.broadcast.date + '.  The pay is ' + $scope.broadcast.pay + '. Are you available?  Please text "yes" or "no"';

		}
		

		$http.post('/broadcasts/', $scope.broadcast).success(function(data){

			$scope.broadcast_sent = 'Sent to: ' + data.to;
			$scope.broadcast = null;

		});

	};

});