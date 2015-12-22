angular.module('recipients', [
		'ngResource', 
		'ui.router',
		'angular-storage',
		'factories.recipients',
		'directives.recipients'
	])
.config(function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('recipients', {
			url: '/recipients',
			views: {
				'' : {
					templateUrl: 'components/recipients/recipients.html', 
					controller: 'recipientsCtrl',
				},
				'recipient@recipients': {
					templateUrl: 'components/shared-views/recipients/new-recipient-form.html' 
				}
			},			
			data: {
				requiresLogin: true
			}
	})
		.state('edit-recipient', {
			url: '/recipients/:id',
			views: {
				'' : {
					templateUrl: 'components/recipients/recipients.html', 
					controller: 'recipientsCtrl',
				},
				'recipient@edit-recipient': {
					templateUrl: 'components/shared-views/recipients/edit-recipient-form.html' 
				}
			},	
			data: {
				requiresLogin: true
			}
		});


})
.controller('recipientListCtrl', function RecipientListController ($scope, $http, recipients) {

	//list recipients
	recipients.all(function(recipients){

		$scope.recipients = recipients;

	});

})
.controller('recipientsCtrl', function RecipientsController ($scope, $http, recipients) {

	$scope.init = function() {

		//selected recipient
		$scope.selected = null;

		//show create recipient form
		$scope.showCreate = null;

		//new roles list
		$scope.newRoles = [];

	};

	//disable/enable
	var disabled = true;

	//validate phone number
	var validPhone = function(phone) {

		regex = /\d{10}/;

		if (regex.test(phone)) {
			return true;
		}
		return false;

	};

	//refresh list 
	var refreshList = function (id) {

		//list recipients
		recipients.all(function(recipients){

			$scope.recipients = recipients;

		});

	};

	//Create and add Recipient
	$scope.addRecipient = function () {

		if (!validPhone($scope.recipient.phone)) {

			alert('Please enter a valid phone number, i.e. 5555555555');

		}
		else {

			$http.post('/api/protected/recipients/lists/add/' + $scope.selected._id, $scope.recipient).success(function(data){

				$scope.recipient_message = data.message;
				$scope.recipient = '';
				refreshList($scope.selected._id);
				

			});

		}	

	};

	$scope.addRole = function() {

		$scope.newRoles.push({

			role: ''

		});

	};

	//edit Recipient
	$scope.editRecipient = function (id) {

		
		if (!validPhone($scope.recipient.phone)) {

			alert('Please enter a valid phone number, i.e. 5555555555');

		}
		else {

			$http.put('/api/protected/recipients/' + id, $scope.recipient).success(function(data) {

				$scope.recipient_message = data.message;
				refreshList($scope.selected._id);
				setDisabled(true);

			});

		}

	};

	//remove Recipient from User
	$scope.removeRecipient = function(recipient) {
		/*
		$http.post('/api/protected/recipients/remove/', recipient).success(function(data) {

			$scope.recipient_message = data.message;
			refreshList($scope.selected._id);
			setDisabled(true);

		});
		*/
	};

	var setDisabled = function(val) {

		disabled = val; 

	};

	//enable and disable
	$scope.isDisabled = function () {

		return disabled;

	};


	$scope.init();

})
.controller('editRecipientCtrl', function EditRecipientControl($scope, $http, $stateParams, recipients) {


	$scope.init = function() {

		console.log('params id: ', $stateParams.id);
		//find recipient if :id
		recipients.find($stateParams.id, function(recipient){

			$scope.recipient = recipient;

		});

	};

	/*
	$scope.newRoles = [];

	$scope.addRole = function() {

		$scope.newRoles.push({

			role: ''

		});

	};
	
	//edit Recipient
	$scope.editRecipient = function (id) {

		
		if (!validPhone($scope.recipient.phone)) {

			alert('Please enter a valid phone number, i.e. 5555555555');

		}
		else {

			$http.put('/api/protected/recipients/' + id, $scope.recipient).success(function(data) {

				$scope.recipient_message = data.message;
				refreshList($scope.selected._id);
				setDisabled(true);

			});

		}

	};

	//remove Recipient from User
	$scope.removeRecipient = function(recipient) {

		$http.post('/api/protected/recipients/remove/' + $scope.selected._id, recipient).success(function(data) {

			$scope.recipient_message = data.message;
			refreshList($scope.selected._id);
			setDisabled(true);

		});

	};
	*/
	$scope.init();

});