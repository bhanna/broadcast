angular.module('main', ['ngResource'])
.config(function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('main', {
			url: '/main',
			controller: 'mainCtrl',
			templateUrl: 'components/main/main.html'
	});

})
.factory('getOpenBroadcasts', function($resource){

	//get all broadcasts where openPositions != 0
	return $resource('/broadcasts/open/all');

})
.factory('getFilledBroadcasts', function($resource){

	//get all broadcasts where openPositions != 0
	return $resource('/broadcasts/filled/all');

})
.factory('List', function($resource){

	return $resource('/lists/:id');

})
.service('manageBroadcasts', function manageBroadcasts ($http, $q) {

	var mb = this;

	//get broadcast by id and get List if necessary
	mb.get = function(id) {

		var defer = $q.defer();
		$http.get('/broadcasts/threads/' + id).success(function(data) {

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
		$http.post('/broadcasts/outgoing?status='+status, thread).success(function(data) {

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
		$http.get('/broadcasts/open/' + id + '?openPositions=true').success(function(data) {

			defer.resolve(data);
			console.log('openPositions from refresh ', data);
			

		}).error(function(err, status) {

			defer.reject(err);
			
		});

		return defer.promise;

	};
	
})
.controller('mainCtrl', function MainController ($scope, $http, getOpenBroadcasts, getFilledBroadcasts, manageBroadcasts) {

	$scope.init = function() {

		//set username
		$scope.welcome_message = 'Welcome to Broadcast';
		//get all open broadcasts
		$scope.openBroadcasts = getOpenBroadcasts.query();

		console.log($scope.openBroadcasts);

		$scope.filledBroadcasts = getFilledBroadcasts.query();

		console.log($scope.filledBroadcasts);

		$scope.selected = null;


	};
	


	//select open broadcast
	//clean this the fuck up
	$scope.select = function(broadcast) {

		$scope.selected = {};

		//set selected to the Open Broadcast
		$scope.selected.broadcast = broadcast;
		
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
				manageBroadcasts.get(data)
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