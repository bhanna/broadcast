angular.module('factories.recipients', [
		'ngResource', 
		'ui.router',
	])
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

		}

	};

});