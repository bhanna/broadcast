angular.module('main', ['ngResource', 'toaster', 'ngAnimate'])
.config(function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('main', {
			url: '/main',
			controller: 'mainCtrl',
			templateUrl: 'components/main/main.html',
			data: {
				requiresLogin: true
			}
	});

})
.factory('getOpenBroadcasts', function($resource){

	//get all broadcasts where openPositions != 0
	return $resource('/api/protected/broadcasts/open/all');

})
.factory('getFilledBroadcasts', function($resource){

	//get all broadcasts where openPositions != 0
	return $resource('/api/protected/broadcasts/filled/all');

})
.service('manageBroadcasts', function manageBroadcasts ($http, $q) {

	var mb = this;

	//get broadcast by id and get List if necessary
	mb.get = function(id) {

		var defer = $q.defer();
		$http.get('/api/protected/broadcasts/threads/' + id).success(function(data) {

			defer.resolve(data);
			console.log('recieved ', data);

		})
		.error(function(err) {

			defer.reject(err);
			console.log('err ', err);

		});

		return defer.promise;

	};


	//send Accepted or Declined response from Admin
	mb.respond = function(response, thread) {

		var status;
		if (response === 0) {
			if (thread.status === 'Pending' || thread.status === 'undefined') {
				status = 'Owner Declined';
			}
			else if (thread.status === 'Available') {
				status = 'Owner Declined';
			}
			else if (thread.status === 'Accepted') {
				status = 'Owner Declined';
			}
			else if (thread.status === 'Confirmed') {
				status = 'Owner Cancelled';
			}
			else if (thread.status === 'Reopened') {
				status = 'Owner Declined';
			}
			
		}
		else if (response === 1) {
			if (thread.status === 'Available') {
				status = 'Accepted';
			}
			else if (thread.status === 'Owner Cancelled' || thread.status === 'Owner Declined') {
				status = 'Reopened';
			}
			else if (thread.status === 'undefined') {
				status = 'Reopened';
			}
			
	
		}
		var defer = $q.defer();
		$http.post('/api/protected/broadcasts/outgoing?status='+status, thread).success(function(data) {

			defer.resolve(data);
			console.log('successfully sent status update ', status);
			

		}).error(function(err, status) {

			defer.reject(err);

		});

		return defer.promise;

	};

	//TODO make one clean refresh function
	mb.refreshPositions = function(id) {

		var defer = $q.defer();
		//get open positions from broadcast using scope.selected.id
		$http.get('/api/protected/broadcasts/open/' + id + '?openPositions=true').success(function(data) {

			defer.resolve(data);
			console.log('openPositions from refresh ', data);
			

		}).error(function(err, status) {

			defer.reject(err);
			
		});

		return defer.promise;

	};
	
})
.controller('mainCtrl', function MainController ($scope, $http, getOpenBroadcasts, getFilledBroadcasts, manageBroadcasts, toaster) {

	$scope.init = function() {

		//set username
		$scope.welcome_message = 'Welcome to Broadcast';
		//get all open broadcasts
		$scope.openBroadcasts = getOpenBroadcasts.query();

		console.log($scope.openBroadcasts);

		$scope.filledBroadcasts = getFilledBroadcasts.query();

		console.log($scope.filledBroadcasts);

		$scope.selected = null;

		var threads;

		var selectedBroadcast;

	};

	//socket io for live status updates
	var socket = io.connect();


	//TODO notify user with toastr of any statusUpdates or Filled or Open broadcast changes to avoid appearing to refresh
	//TODO why is this firing twice?
	//update DOM with text from /incoming
	socket.on('statusUpdate', function(data) {

		console.log('DATA: ', data);
		console.log('from SOCKET threads: ', threads);  
		console.log('from SOCKET selectedBroadcast: ', selectedBroadcast);

		if (data.broadcast_id === selectedBroadcast.broadcast_id) {

			$scope.selected = {};

			console.log('threads[0]: ', threads[0]);
			$scope.$apply(function() {

				$scope.selected.broadcast = selectedBroadcast;
				$scope.selected.threads = threads;

				manageBroadcasts.refreshPositions(selectedBroadcast._id)
					.then(function(data) {

						$scope.selected.broadcast.openPositions = data;

						//TODO if openPositions changed from n - 0 or vice versa notify user

						//get openPositions and respond accordingly
						$scope.filledBroadcasts = getFilledBroadcasts.query();
						$scope.openBroadcasts = getOpenBroadcasts.query();

					});

				if (data.firstName === 'Single') {

					$scope.selected.threads[0].status = data.status;

					toaster.pop({

			        	type: 'info', 
			        	title: $scope.selected.threads[0].firstName,
			        	body: 'from Broadcast ' + selectedBroadcast.title + ' updated status to ' + data.status,
			        	showCloseButton: true

			        });

			        console.log('SOCKET SINGLE');

				}	
				else {

					//loop in threads to find correct recipient to update
					for (var i = 0; i < $scope.selected.threads.length; i++) {

						if ($scope.selected.threads[i].phone === data.phone) {

							$scope.selected.threads[i].status = data.status;
							toaster.pop({

					        	type: 'info', 
					        	title: $scope.selected.threads[i].firstName,
					        	body: 'from Broadcast ' + selectedBroadcast.title + ' updated status to ' + data.status,
					        	showCloseButton: true

					        });

					        console.log('SOCKET MULTI');

						}

					}	

				}
				
			});
			
			console.log('from SOCKET scope.selected: ', $scope.selected);			

		}

	});



	//select open broadcast
	//clean this the fuck up
	$scope.select = function(broadcast) {

		$scope.selected = {};

		//set selected to the Open Broadcast
		$scope.selected.broadcast = broadcast;

		selectedBroadcast = broadcast;
		
		manageBroadcasts.get(broadcast.broadcast_id)
			.then(function(data) {

				console.log('threads recieved in View: ', data);
				//then populate open broadcast table with broadcast data
				$scope.selected.threads = data;
				console.log('broadcast data ', $scope.selected.broadcast);
				console.log('threads ', $scope.selected.threads);


				//populate table with recipient name from data.recipients

				if ($scope.selected.threads[0].firstName === 'Single') {

					$scope.selected.threads[0].firstName = $scope.selected.threads[0].phone;
					
				}

				//TODO get action from data.conversaions
				//TODO add last action date
				
				threads = $scope.selected.threads;

			}, function(err) {

				console.log('err at get ', err);

			});
			
		//QUESTION display all selected broadcast threads?

	};


	//send Admin response Accepted or Declined
	$scope.ownerResponse = function(response, thread) {

		//update thread status to 'response'
		manageBroadcasts.respond(response, thread)
			.then(function(data) {
				$scope.openBroadcasts = getOpenBroadcasts.query();
				$scope.filledBroadcasts = getFilledBroadcasts.query();
				if (data.message) {
					alert(data.message);
					id = data.broadcast_id;
				}
				else {
					id = data;
				}
				manageBroadcasts.get(id)
					.then(function(data) {

						console.log('threads recieved in View: ', data);
						
						//then populate open broadcast table with broadcast data
						$scope.selected.threads = data;
						console.log('broadcast data ', $scope.selected.broadcast);
						console.log('threads ', $scope.selected.threads);

						//populate table with recipient name from data.recipients

						if ($scope.selected.threads[0].firstName === 'single') {

							$scope.selected.threads[0].firstName = $scope.selected.threads[0].phone;
						}

						//TODO get action from data.conversaions
						//TODO add last action date
						
						manageBroadcasts.refreshPositions($scope.selected.broadcast._id)
							.then(function(data) {
								$scope.selected.broadcast.openPositions = data;
								console.log('scope openPositions: ', $scope.selected.broadcast.openPositions);
								
								

							}, function(err) {

								console.log('err at refreshPositions ', err);

							});

					}, function(err) {

						console.log('err at get ', err);

					});
				
				
			}, function(err) {

				console.log(err);

			});

	};


	$scope.init();

});