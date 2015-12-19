angular.module('factories.recipients', [
		'ngResource', 
		'ui.router',
	])
.factory('recipients', function($resource, $http){

	return {

		list: function(callback) {

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

		}

	};

});