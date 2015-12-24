angular.module('controllers.recipients', [
	'ngResource', 
	'ui.router',
	'services.validators'
	])
.controller('recipientListCtrl', function RecipientListController ($scope, $http, recipients) {

	//list recipients
	recipients.all(function(recipients){

		$scope.recipients = recipients;

	});

})
.controller('recipientsCtrl', function RecipientsController ($scope, $http, recipients, validate) {

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

	/*
	//validate phone number
	var validPhone = function(phone) {

		regex = /\d{10}/;

		if (regex.test(phone)) {
			return true;
		}
		return false;

	};
	*/
	//refresh list 
	var refreshRecipientList = function () {

		//list recipients
		recipients.all(function(recipients){

			$scope.recipients = recipients;

		});

	};
	/*
	//remove empty roles from newRoles
	var removeEmptyRoles = function(roles) {

		var results = [];

		for(var i=0; i < roles.length; i++) {

			if (roles[i].role !== '') {
				results.push(roles[i].role);
			}

		}

		return results;

	};
	*/
	//create recipient
	$scope.createRecipient = function (recipient, roles) {

		var phone = recipient.phone1 + recipient.phone2 + recipient.phone3;

		if (!validate.phone(phone)) {

			alert('Please enter a valid phone number, i.e. 555 555 5555');

		}
		else {

			recipient.phone = phone;

			recipient.roles = validate.removeEmptyRoles(roles);

			//TODO still need to create endpoint
			recipients.createRecipient(recipient, function(data) {

				$scope.recipient_message = data.message;
				$scope.recipient = {};
				$scope.newRoles = [];
				//refreshRecipientList();

			});

		}	

	};

	$scope.addRole = function() {

		//var newRoleNo = $scope.newRoles.length+1;
  		$scope.newRoles.push({role : ''});

			console.log('newRoles: ', $scope.newRoles);
	};

	//edit Recipient
	$scope.editRecipient = function (recipient, roles) {

		var phone = recipient.phone1 + recipient.phone2 + recipient.phone3;

		if (!validate.phone(phone)) {

			alert('Please enter a valid phone number, i.e. 555 555 5555');

		}
		else {

			recipient.phone = phone;

			console.log('recipient.roles before: ', roles);

			recipient.roles = validate.removeEmptyRoles(roles);

			console.log('recipient.roles: ', recipient.roles);
			
			$http.put('/api/protected/recipients/' + recipient._id, recipient).success(function(data) {

				$scope.recipient_message = data.message;
				$scope.newRoles = [];
				//refreshList($scope.selected._id);
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




//FROM LIST



	$scope.init();

})
.controller('editRecipientCtrl', function EditRecipientControl($scope, $http, $stateParams, recipients) {


	$scope.init = function() {

		console.log('params id: ', $stateParams.id);
		//find recipient if :id
		recipients.find($stateParams.id, function(recipient){

			$scope.recipient = recipient;

			$scope.recipient.phone1 = recipient.phone.substr(0, 3);
			$scope.recipient.phone2 = recipient.phone.substr(3, 3);
			$scope.recipient.phone3 = recipient.phone.substr(6, 4);

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