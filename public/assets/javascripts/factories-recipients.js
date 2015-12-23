angular.module('factories.recipients', [])
.factory('recipients', function($resource, $http){

	return {

		all: function(callback) {

			$http({

				method: 'GET',
				url: '/api/protected/recipients/',
				cache: true

			}).success(callback);

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
				cache: true

			}).success(callback);

		},
		createRecipient: function(recipient, callback) {

			$http({

				method: 'POST',
				url: '/api/protected/recipients/',
				data: recipient,
				cache: true

			}).success(callback);
		},
		createRecipientForList: function(recipient, list_id, callback) {

			$http({

				method: 'POST',
				url: '/api/protected/recipients/lists/add/' + list_id,
				data: recipient,
				cache: true

			}).success(callback);

		}

	};

});