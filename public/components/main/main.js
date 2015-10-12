angular.module('main', ['ngResource'])
.config(function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('main', {
			url: '/main',
			controller: 'mainCtrl',
			templateUrl: 'components/main/main.html'
	});

})
.factory('getRecipients', function($resource){

	return $resource('/recipients/:id');

})
.controller('mainCtrl', function MainController ($scope, $http, $location, getRecipients) {

	$scope.username = 'Matthew';
	$scope.tasks = [
			'Upload recipient list',
			'Input Message',
			'Send message to recipients',
			'Receive response "yes" & "no"',
			'Update status in recipient list'
			];

	$scope.allRecipients = getRecipients.query();

	$scope.recipient = {};

	$scope.postRecipient = function () {

		$http.post('/recipients/single', $scope.recipient).success(function(data){

			$scope.recipient_message = data.message;
			$scope.allRecipients = getRecipients.query();

		});

	};

	$scope.message = {};

	$scope.postMessage = function () {

		$http.post('/messages/', $scope.message).success(function(data){

			$scope.message = {title: '', body: '', to: ''};
			$scope.message_sent = 'Sent to: ' + data.to;

		});

	};

});