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

	$routeProvider.when('/files', {
		templateUrl: 'files',
		controller: 'FilesController',
		resolve: {
			"expiry" : function($http) {
				return $http.get('/expiry');
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