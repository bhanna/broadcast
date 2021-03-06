angular.module('my-lists', [
		'ngResource', 
		'ui.router',
		'angular-storage',
		'factories.recipients',
		'services.validators'
	])
.config(function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('my-lists', {
			url: '/my-lists',
			views: {
				'' : {
					templateUrl: 'components/lists/my-lists.html',
					controller: 'listCtrl',
				},
				'newRecipient@my-lists': {
					templateUrl: 'components/shared-views/recipients/create-recipient-for-list-form.html' 
				}
			},
			data: {
				requiresLogin: true
			}
	});

})
.factory('getAllLists', function($resource){

	return $resource('/api/protected/lists/all');

})
//.factory('Recipient', function($resource){

//	return $resource('/api/protected/recipients/:id');

//})
.controller('listCtrl', function ListController ($scope, $http, $resource, $location, $q, getAllLists, recipients, validate) {

	$scope.init = function() {

		//get all lists
		$scope.lists = getAllLists.query();

		if ($scope.lists === {}) {
			$scope.noLists = true;
		}
		else {
			$scope.noLists = false;
		}
		//list
		$scope.list = {};

		//selected list
		$scope.selected = null;

		//show create list form
		$scope.showCreate = null;

		//recipient
		$scope.recipient = {};

		//recipient action message
		$scope.recipient_message = null;

		//list action message
		$scope.list_message = null;

		//show add recipient form
		$scope.addRecipients = null;

		//recipients exist
		$scope.no_recipients = true;

		//create new recipient form
		$scope.createRecipientForm = false;

		//new roles list
		$scope.newRoles = [];

		//list recipients
		$scope.listEmpty = null;

	};

//LISTS
	
	//list getter
	var List = $resource('/api/protected/lists/:id', {}, {'get': {method: 'GET', isArray: false}});

	//disable/enable
	var disabled = true;

	//does a list have recipients
	var listEmpty = function (data) {
		return data === 0;
	};

	//refresh list 
	var refreshList = function (id) {

		List.get({id: id}, function(data) {

			$scope.selected = data;
			$scope.listEmpty = listEmpty(data.recipients.length) ? true : false;

		});
		$scope.recipient = '';

	};	

	var getList = function (id) {

		$scope.showCreate = null;

		List.get({id: id}, function(data) {
			
			$scope.selected = data;
			$scope.list_message = null;
			$scope.recipient_message = null;
			$scope.listEmpty = listEmpty(data.recipients.length) ? true : false;

		});

	};

	//select list
	$scope.getList = function (id) {

		getList(id);		

	};


	//showCreateList
	$scope.showCreateList = function () {

		$scope.selected = null;
		$scope.showCreate = true;

	};


	//createList
	$scope.createList = function () {

		$http.post('/api/protected/lists/', $scope.list).success(function(data){

			//$scope.list_message_class = 'alert-success';
			//$scope.list_message = data.message;
			$scope.lists = getAllLists.query();
			getList(data.list_id);

		});

	};


	//delete list
	$scope.deleteList = function () {

		if (confirm('This cannot be undone!  Would you like to delete this list?')) {
			
			$http.delete('/api/protected/lists/' + $scope.selected._id).success(function(data) {

				$scope.list_message = data.message;
				$scope.list_message_class = data.message_class;
				$scope.lists = getAllLists.query();
				$scope.selected = null;

			});
			
		}
		
	};


//RECIPIENTS

	var refreshRecipients = function() {
		recipients.allButCurrentList($scope.selected._id, function(recipients) {

			if (recipients.length !== 0) {
				$scope.no_recipients = false;
				$scope.recipient_list = recipients;

			}
			else {

				$scope.createRecipientForm = true;
				$scope.no_recipients = true;

			}

		});
	};
	
	//showCreateList
	$scope.showAddRecipients = function () {

		$scope.addRecipients = true;

		//show list of recipients NOT in current list
		refreshRecipients();

	};

	$scope.showCreateRecipient = function() {

		$scope.createRecipientForm = true;

	};

	$scope.closeBox = function() {

		$scope.addRecipients = false;

	};


//TODO figure out how to separate these functions into modules properly

	//add recipient to list from current recipients
	//TODO add a check mark when added or something
	$scope.addRecipientToList = function (recipient) {

		recipients.addRecipientToList(recipient, $scope.selected._id, function(data) {

			$scope.recipient_message = data.message;
			$scope.recipient = {};
			refreshList($scope.selected._id);
			console.log('selected id ', $scope.selected._id);
			refreshRecipients();
			

		});

	};

	//Create and add recipient to list
	$scope.createRecipientForList = function(recipient, roles) {

		var phone = recipient.phone1 + recipient.phone2 + recipient.phone3;

		if (!validate.phone(phone)) {

			alert('Please enter a valid phone number, i.e. 555 555 5555');

		}
		else {

			recipient.phone = phone;

			console.log('recipient.roles before: ', roles);

			recipient.roles = validate.removeEmptyRoles(roles);

			console.log('recipient.roles: ', recipient.roles);

			console.log('recipient: ', recipient);
			
			recipients.createRecipientForList(recipient, $scope.selected._id, function(data) {

				$scope.recipient_message = data.message;
				$scope.recipient = {};
				refreshList($scope.selected._id);
				$scope.addRecipients = false;

			});
			
		}	

	};


	//remove Recipient from List
	$scope.removeRecipientFromList = function(recipient) {

		recipients.removeRecipientFromList(recipient, $scope.selected._id, function(data) {

			$scope.recipient_message = data.message;
			refreshList($scope.selected._id);
			setDisabled(true);
			refreshRecipients();
	
		});
	};

	var setDisabled = function(val) {

		disabled = val; 

	};

	//enable and disable
	$scope.isDisabled = function () {

		return disabled;

	};


	$scope.init();

});