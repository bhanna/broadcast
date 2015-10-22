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
//TODO put services like broadcast and List in main app?
.service('broadcast', function broadcast($http, $q, List) {

	var b = this;

	//create the Broadcast
	b.create = function(data) {

		//TODO set loading screen while broadcastThreads are sent

		//var phone = data.to;
		//var name = '';
		var defer = $q.defer();

		$http.post('/broadcasts/', data).success(function(data) {

			defer.resolve(data);
			console.log('created broadcast ', data.title);
			

		})
		.error(function(err, status) {

			defer.reject(err);

		});

		return defer.promise;

		//TODO post to sendBroadcast with all numbers or single number and listname or Single Name
		//sendBroadcast(data, phone, name);
	};

	//send to single Recipient
	b.sendSingle = function(data, bID) {

		var results = {};
		var defer = $q.defer();

		$http.post('/broadcasts/outgoing?phone=' + data.phone + '&id=' + bID, data).success(function(data){

			results.message = 'Sent to ' + data.phone;
			results.messageClass = 'alert-success';
			defer.resolve(results);

		})
		.error(function(err, status) {

			console.log('err ', err);
			defer.reject(err);

		});

		return defer.promise;

	};

	//create phone number array from the List
	b.prepareMulti = function(listID, bID) {

		var numbers = [];
		var listName;
		var results = {};
		results.recipients = [];
		results.id = bID;

		var defer = $q.defer();

		List.get({id: listID}, function(list) {

			results.listName = list.listName;
			
			angular.forEach(list.listItems, function(val) {

				var recipient = {

					name: val.firstName,
					phone: val.phone

				};

				results.recipients.push(recipient);
				console.log('results.recipients ', results.recipients);

			});
			console.log('results: ', results);
			defer.resolve(results);
		
		});

		return defer.promise;

	};

	//send to all List members
	b.sendMulti = function(message, data) {

		var results = {};
		console.log('recipients ', data.recipients);
		var promises = data.recipients.map(function(recipient) {

			return $http.post('/broadcasts/outgoing?phone=' + recipient.phone + '&name=' + recipient.name + '&id=' + data.id, message).success(function(data) {

				console.log('sent to ' + data.phone);

			})
			.error(function(err, status) {

				console.log('err ', err);

			});

		});
		
		return $q.all(promises);

	};

	return b;

})
.controller('broadcastsCtrl', function BroadcastsController ($scope, $http, $state, $q, getAllLists, List, broadcast) {


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

	};
	

	//TODO make all this cleaner

	//showCreateList
	
	$scope.showSingleRecipient = function () {

		$scope.selected = null;
		$scope.showSingle = true;

	};

	//TODO remove duplicate code (copied from my-lists.js)
	//selec list
	
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

		broadcast.create($scope.broadcast)
			.then(function(data) {

				//success
				broadcast.sendSingle($scope.broadcast, data.id)
					.then(function(data) {

						//TODO clear loading screen when done sending
						$scope.broadcast_message = data.message;
						$scope.broadcast_message_class = data.messageClass;

					}, function(err) {

						//error
						console.log('send single err ', err);

					});

			}, function(err) {

				//error
				console.log('create single err ', err);

			});

	};
	

	//prepare the message for multi passing id for List
	
	$scope.prepareMultiMessage = function (id) {

		//TODO add Sender from User account

		//define list id to track during Broadcast creation
		$scope.broadcast_multi.list_id = id;

		broadcast.create($scope.broadcast_multi)
			.then(function(data) {

				//success
				broadcast.prepareMulti($scope.selected._id, data.id)
					.then(function(data) {

						//success
						broadcast.sendMulti($scope.broadcast_multi, data)
							.then(function(data) {

								//success
								//TODO clear loading screen when done sending
								$scope.broadcast_message = 'Sent!';
								$scope.broadcast_message_class = 'alert-success';

							},
							function(err) {

								//error
								console.log('error at send Multi', err);
								$scope.broadcast_message = 'There was an error...';
								$scope.broadcast_message_class = 'alert-danger';

							});
						
					}, function(err) {

						//error
						console.log('prepare Multi err ', err);

					});

			}, function(err) {

				//error
				console.log('create single err ', err);

			});

	};	


	$scope.init();
	
});