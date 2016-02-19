angular.module('factories.recipients', [])
.factory('recipients', function($resource, $http){

	return {

		all: function() {

			return $resource('/api/protected/recipients/');

		},
		find: function(id, callback) {

			$http({

				method: 'GET',
				url: '/api/protected/recipients/' + id,
				cache: true

			}).success(callback);

		},
		allButCurrentList: function(list_id, callback) {

			$http({

				method: 'GET',
				url: '/api/protected/recipients/allButCurrentList/' + list_id,

			}).success(callback);

		},
		createRecipient: function(recipient, callback) {

			$http({

				method: 'POST',
				url: '/api/protected/recipients/',
				data: recipient,

			}).success(callback);
		},
		createRecipientForList: function(recipient, list_id, callback) {

			$http({

				method: 'POST',
				url: '/api/protected/recipients/lists/add/' + list_id,
				data: recipient,

			}).success(callback);

		},
		addRecipientToList: function(recipient, list_id, callback) {

			$http({

				method: 'POST',
				url: '/api/protected/recipients/lists/add/' + list_id,
				data: recipient,

			}).success(callback);

		},
		editRecipient: function(recipient, callback) {

			$http({

				method: 'PUT',
				url: '/api/protected/recipients/' + recipient._id,
				data: recipient,

			}).success(callback);

		},
		removeRecipientFromList: function(recipient, list_id, callback) {

			$http({

				method: 'POST',
				url: '/api/protected/recipients/lists/remove/' + list_id,
				data: recipient,

			}).success(callback);

		}

	};

});