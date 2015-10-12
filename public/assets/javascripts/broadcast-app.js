
angular.module('broadcastApp', [

	'signup',
	'login',
	'main'

])
.config( function broadcastAppConfig ($urlRouterProvider){

	$urlRouterProvider.otherwise('/');

});
/*
.controller( 'AppCtrl', function AppCtrl ($scope, $location) {

	$scope.$on()

});
*/