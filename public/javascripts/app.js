'use strict';
/* App Module */
var app = angular.module("app", ['ngSanitize']).config(function($routeProvider) {
	$routeProvider.when('/login', {
		templateUrl: 'login.html',
		controller: 'LoginController'
	});

	$routeProvider.when('/home', {
		templateUrl: 'home.html',
		controller: 'HomeController'
	});

	$routeProvider.when('/files', {
		templateUrl: 'files.html',
		controller: 'FilesController',
		resolve: {
			files : function(FileService) {
				return FileService.get();
			}
		}
	});

	$routeProvider.otherwise({ redirectTo: '/login' });
});

app.config(function($httpProvider) {
	
	var logsOutUserOn401 = function($location, $q, SessionService, FlashService) {
		var success = function(response) {
			return response;
		};
		var error	= function(response) {
			if(response.status === 401) { // HTTP NotAuthorized
				SessionService.unset('authenticated');
				$location.path('/login');
				FlashService.show(response.data.flash, "danger");
				return $q.reject(response);
			} else {
				return $q.reject(response);
			}
		};

		return function(promise) {
			return promise.then(success, error)
		};
	}

	$httpProvider.responseInterceptors.push(logsOutUserOn401);

});

app.run(function($rootScope, $location, AuthenticationService, FlashService) {

	var routesThatRequireAuth = ['/files'];

	$rootScope.$on('$routeChangeStart', function(event, next, current) {
		if( _(routesThatRequireAuth).contains($location.path()) && !AuthenticationService.isLoggedIn() ) {
			$location.path('/login');
			FlashService.show("Please log in to continue", "danger");
		}
	});
});