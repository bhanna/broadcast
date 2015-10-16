
angular.module('broadcastApp', [

	'signup',
	'login',
	'main',
	'my-lists',
	'broadcasts'

])
.config( function broadcastAppConfig ($urlRouterProvider){

	$urlRouterProvider.otherwise('/');

});
/*
.controller( 'AppCtrl', function AppCtrl ($scope, $location) {

	$scope.$on()

});
*/