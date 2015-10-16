angular.module('my-lists', [
		'ngResource', 
		'ui.router',
		'angular-storage',
		'ngAnimate'
	])
.config(function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('myLists', {
			url: '/my-lists',
			controller: 'listCtrl',
			templateUrl: 'components/lists/my-lists.html'
	});

})
.factory('getAllLists', function($resource){

	return $resource('/lists/all');

})
.factory('List', function($resource){

	return $resource('/lists/:id');

})
.factory('Recipient', function($resource){

	return $resource('/recipients/:id');

})
.controller('listCtrl', function ListController ($scope, $http, $location, getAllLists, List, Recipient) {

	$scope.username = 'Matthew';
	//$scope.listRecipients = getListRecipients.query();
	$scope.lists = getAllLists.query();

	if ($scope.lists === {}) {
		$scope.noLists = true;
	}
	else {
		$scope.noLists = false;
	}

	//refresh list
	var refreshList = function (list_id) {

		List.get({id: list_id}, function(data) {

			$scope.selected = data;

		});
		$scope.recipient = '';

	};

	//select list
	$scope.selected = null;
	$scope.getList = function (list) {

		$scope.showCreate = null;
		List.get({id: list._id}, function(data) {

			$scope.selected = data;
			$scope.list_message = null;
			$scope.recipient_message = null;

		});

	};


	//showCreateList
	$scope.showCreate = null;
	$scope.showCreateList = function () {

		$scope.selected = null;
		$scope.showCreate = true;

	};


	//createList
	$scope.list = {};

	$scope.createList = function () {

		$http.post('/lists/', $scope.list).success(function(data){

			$scope.list_message_class = 'alert-success';
			$scope.list_message = data.message;
			$scope.lists = getAllLists.query();

		});

	};


	//delete list
	$scope.deleteList = function () {

		if (confirm('This cannot be undone!  Would you like to delete this list?')) {

			$http.delete('/lists/' + $scope.selected._id).success(function(data) {

				$scope.list_message = data.message;
				$scope.lists = getAllLists.query();
				$scope.selected = null;

			});
		
		}
		
	};


	//add Recipients
	$scope.recipient = {};

	$scope.createRecipient = function () {

		$http.post('/recipients/single?list_id=' + $scope.selected._id, $scope.recipient).success(function(data){

			$scope.recipient_message = data.message;
			refreshList($scope.selected._id);
			//$scope.listRecipients = getListRecipients.query();

		});

	};

	$scope.editRecipient = function (id) {

		$http.get('/recipients/' + id + '?list_id=' + $scope.selected._id).success(function(data) {

			$scope.recipient = data;

		});

	};

	$scope.updateRecipient = function (id) {

		$http.put('/recipients/' + id + '?list_id=' + $scope.selected._id, $scope.recipient).success(function(data) {

			$scope.recipient_message = data.message;
			refreshList($scope.selected._id);

		});

	};


	//delete Recipient
	$scope.recipient_message = null;
	
	$scope.deleteRecipient = function(id) {

		$http.delete('/recipients/' + id + '?list_id=' + $scope.selected._id).success(function(data) {

			$scope.recipient_message = data.message;
			refreshList($scope.selected._id);

		});

	};

});