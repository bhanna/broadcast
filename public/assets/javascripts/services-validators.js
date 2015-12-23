angular.module('services.validators', [])
.service('validate', function validate() {

	var v = this;

		v.phone = function(phone) {

			regex = /\d{10}/;

			if (regex.test(phone)) {
				return true;
			}
			return false;

		};

		v.removeEmptyRoles = function(roles) {

			var results = [];

			for(var i=0; i < roles.length; i++) {

				if (roles[i].role !== '') {
					results.push({'role': roles[i].role});
				}

			}

			return results;

		};


});