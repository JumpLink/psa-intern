'use strict';
/* App Module */
var app = angular.module("app", []).config(function($routeProvider) {
	$routeProvider.when('/login', {
		templateUrl: 'login',
		controller: 'LoginController'
	});

	$routeProvider.when('/home', {
		templateUrl: 'home',
		controller: 'HomeController'
	});

	$routeProvider.otherwise({ redirectTo: '/login' });
});

