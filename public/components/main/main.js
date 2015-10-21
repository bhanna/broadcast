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
.factory('List', function($resource){

	return $resource('/lists/:id');

})
.service('manageOpen', function manageOpen ($http, $q, List) {

	var mo = this;

	//get broadcast by id and get List if necessary
	mo.getOpen = function(id) {

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

	//TODO combine decline and accept and make status a variable

	mo.decline = function(thread) {

		var defer = $q.defer();
		$http.post('/broadcasts/outgoing?status=Declined', thread).success(function(data) {

			defer.resolve(data);
			console.log('successfully sent decline');
			//refresh selected open broadcast with 
			

		}).error(function(err, status) {

			defer.reject(err);

		});

		return defer.promise;

	};

	mo.accept = function(thread) {

		var defer = $q.defer();
		$http.post('/broadcasts/outgoing?status=Confirmed', thread).success(function(data) {

			defer.resolve(data);
			console.log('successfully sent accept');
			//refresh selected open broadcast with 
			

		}).error(function(err, status) {

			defer.reject(err);

		});

		return defer.promise;

	};

})
.controller('mainCtrl', function MainController ($scope, $http, getOpenBroadcasts, manageOpen) {

	$scope.init = function() {

		//set username
		$scope.username = 'Matthew';
		//get all open broadcasts
		$scope.openBroadcasts = getOpenBroadcasts.query();

		console.log($scope.openBroadcasts);

		$scope.selected = null;


	};
	


	//select open broadcast
	//clean this the fuck up
	$scope.selectOpen = function(oB) {

		$scope.selected = {};

		//set selected to the Open Broadcast
		$scope.selected.oB = oB;
		
		manageOpen.getOpen(oB.broadcast_id)
			.then(function(data) {

				console.log('threads recieved in View: ', data);
				//then populate open broadcast table with broadcast data
				$scope.selected.threads = data;
				console.log('oB data ', $scope.selected.oB);
				console.log('threads ', $scope.selected.threads);

				//populate table with recipient name from data.recipients

				if ($scope.selected.threads[0].firstName === 'single') {

					$scope.selected.threads[0].firstName = $scope.selected.threads[0].phone;
				}

				//TODO get action from data.conversaions
				//TODO add last action date
				

			}, function(err) {

				console.log('err at getOpen ', err);

			});
			
		//display all selected oB threads?

	};



	//TODO combine decline and accept and make status a variable
	$scope.accept = function(thread) {

		//TODO send broadcast_id and phone to outgoing
		//update thread status to 'Declined'
		manageOpen.accept(thread)
			.then(function(data) {

				manageOpen.getOpen(data.broadcast_id)
					.then(function(data) {

						console.log('threads recieved in View: ', data);
						//then populate open broadcast table with broadcast data
						$scope.selected.threads = data;
						console.log('oB data ', $scope.selected.oB);
						console.log('threads ', $scope.selected.threads);

						//populate table with recipient name from data.recipients

						if ($scope.selected.threads[0].firstName === 'single') {

							$scope.selected.threads[0].firstName = $scope.selected.threads[0].phone;
						}

						//TODO get action from data.conversaions
						//TODO add last action date
						

					}, function(err) {

						console.log('err at getOpen ', err);

					});
			}, function(err) {

				console.log(err);

			});

	};


	$scope.decline = function(thread) {

		//TODO send broadcast_id and phone to outgoing
		//update thread status to 'Declined'
		manageOpen.decline(thread)
			.then(function(data) {

				manageOpen.getOpen(data.broadcast_id)
					.then(function(data) {

						console.log('threads recieved in View: ', data);
						//then populate open broadcast table with broadcast data
						$scope.selected.threads = data;
						console.log('oB data ', $scope.selected.oB);
						console.log('threads ', $scope.selected.threads);

						//populate table with recipient name from data.recipients

						if ($scope.selected.threads[0].firstName === 'single') {

							$scope.selected.threads[0].firstName = $scope.selected.threads[0].phone;
						}

						//TODO get action from data.conversaions
						//TODO add last action date
						

					}, function(err) {

						console.log('err at getOpen ', err);

					});

			}, function(err) {

				console.log(err);

			});

	};

	$scope.init();

});