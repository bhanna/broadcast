angular.module('directives.recipients', [])
.directive('roleInput', function($compile) {
	return {
		
		scope: {
			role: '='
		},
		templateUrl: '../../components/directive-templates/recipients/role-input-template.html',
		link: function(scope, elem, attr, ctrl) {}

	};

});