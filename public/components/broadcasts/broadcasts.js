angular.module('broadcasts', [
	'ui.router',
	'angular-storage'

])
.config(function($stateProvider) {

	$stateProvider
		.state('broadcasts', {
			url: '/broadcasts',
			controller: 'broadcastsCtrl',
			templateUrl: 'components/broadcasts/broadcasts.html',
			data: {
				requiresLogin: true
			}
	});

})
//TODO remove duplicate code (copied from my-lists.js)
.factory('getAllLists', function($resource){

	return $resource('/api/protected/lists/all');

})
//TODO remove duplicate code (copied from my-lists.js)
.factory('List', function($resource){

	return $resource('/api/protected/lists/:id');

})
//TODO put services like broadcast and List in main app?
.service('broadcast', function broadcast($http, $q, List) {

	var b = this;

	//create the Broadcast
	b.create = function(data) {

		//TODO set loading screen while broadcastThreads are sent

		//var phone = data.to;
		//var name = '';
		var defer = $q.defer();

		$http.post('/api/protected/broadcasts/', data).success(function(data) {

			defer.resolve(data);
			console.log('created broadcast ', data);
			

		})
		.error(function(err, status) {

			defer.reject(err);

		});

		return defer.promise;


	};


	return b;

})
.controller('broadcastsCtrl', function BroadcastsController ($scope, $http, $location, $q, getAllLists, List, broadcast) {


	$scope.init = function() {

		//remove duplicate code (copied from my-lists.js)
		$scope.lists = getAllLists.query();
		//for showing form for single Recipient
		$scope.showSingle = null;
		//for showing form for List
		$scope.selected = null;
		//message for single recipient
		$scope.broadcast = {};
		//message for List
		$scope.broadcast_multi = {};
		//enable submit button
		$scope.isProcessing = false;

	};
	

	//TODO make all this cleaner

	//showCreateList
	
	$scope.showSingleRecipient = function () {

		$scope.selected = null;
		$scope.showSingle = true;

	};

	//TODO remove duplicate code (copied from my-lists.js)
	//select list
	
	$scope.selectList = function(list) {

		List.get({id: list._id}, function(data) {
			$scope.showSingle = null;
			$scope.selected = data;

		});

	};




	//create broadcast 
	//populate broadcast threads with broadcastThread forEach Recipient if Multi
	//send

	//prepare the message for single Recipient

	$scope.prepareSingleMessage = function () {

		
		//TODO add Sender from User account

		//disable submit buttons
		$scope.isProcessing = true;

		broadcast.create($scope.broadcast)
			.then(function(data) {

				//TODO clear loading screen when done sending
				//$scope.broadcast_message = data.message;
				//$scope.broadcast_message_class = data.messageClass;
				
				//enable submit buttons
				$scope.isProcessing = false;

				//re-route to dashboard
				$location.path('/main');

			}, function(err) {

				//error
				$scope.broadcast_message = data.message;
				$scope.broadcast_message_class = data.messageClass;
				console.log('create single err ', err);

				//enable submit buttons
				$scope.isProcessing = false;

			});

	};
	

	//prepare the message for multi passing id for List
	
	$scope.prepareMultiMessage = function (id) {

		//TODO add Sender from User account

		//disable submit buttons
		$scope.isProcessing = true;

		//define list id to track during Broadcast creation
		$scope.broadcast_multi.list_id = id;

		broadcast.create($scope.broadcast_multi)
			.then(function(data) {

				//$scope.broadcast_message = data.message;
				//$scope.broadcast_message_class = data.messageClass;

				//enable submit buttons
				$scope.isProcessing = false;

				//re-route to dashboard
				$location.path('/main');
				
			}, function(err) {

				//error
				$scope.broadcast_message = 'Sorry! There was an error...';
				$scope.broadcast_message_class = 'alert-danger';
				console.log('create multi err ', err);

				//enable submit buttons
				$scope.isProcessing = false;

			});

	};	


	$scope.init();
	
});