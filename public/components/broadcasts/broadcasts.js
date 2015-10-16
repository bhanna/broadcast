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
//TODO remove duplicate code (copied from my-lists.js)
.factory('getAllLists', function($resource){

	return $resource('/lists/all');

})
//TODO remove duplicate code (copied from my-lists.js)
.factory('List', function($resource){

	return $resource('/lists/:id');

})
.controller('broadcastsCtrl', function BroadcastsController ($scope, $http, $state, getAllLists, List) {

	//remove duplicate code (copied from my-lists.js)
	$scope.lists = getAllLists.query();

	//TODO make all this cleaner

	//showCreateList
	$scope.showSingle = null;
	$scope.showSingleRecipient = function () {

		$scope.selected = null;
		$scope.showSingle = true;

	};

	//TODO remove duplicate code (copied from my-lists.js)
	//selec list
	$scope.selected = null;
	$scope.selectList = function(list) {

		List.get({id: list._id}, function(data) {
			$scope.showSingle = null;
			$scope.selected = data;

		});

	};

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

			$scope.broadcast_message = 'Sent to: ' + data.to;
			$scope.broadcast_message_class = 'alert-success';
			$scope.broadcast = null;

		});

	};
	

	//TODO clean up with multiple controllers?

	$scope.broadcast_multi = {};

	$scope.sendMultiBroadcast = function(id) {

		List.get({id: id}, function(data) {

			angular.forEach(data.listItems, function(val) {

				$http.post('/broadcasts/', $scope.broadcast_multi).success(function(data){

					$scope.broadcast_message = 'Sent to: ' + data.to;
					$scope.broadcast_message_class = 'alert-success';
					console.log('tried to send to ', val);

				});

			});
			//$scope.broadcast = null;

		});

	};
	


});