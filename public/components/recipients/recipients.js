angular.module('recipients', [
		'ngResource', 
		'ui.router',
		'angular-storage',
		'factories.recipients',
		//'directives.recipients',
		'controllers.recipients'
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
					templateUrl: 'components/shared-views/recipients/create-recipient-form.html' 
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


});