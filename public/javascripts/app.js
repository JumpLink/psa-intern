'use strict';
/* App Module */
var app = angular.module("app", ['ngSanitize']);

app.config(function($routeProvider) {
	$routeProvider.when('/login', {
		templateUrl: 'login.html',
		controller: 'LoginController'
	});

	$routeProvider.when('/about', {
		templateUrl: 'about.html',
		controller: 'AboutController'
	});

	$routeProvider.when('/messages', {
		templateUrl: 'messages.html',
		controller: 'MessageController',
		resolve: {
			messages : function(MessageService) {
				return MessageService.getLatest();
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

	var routesThatRequireAuth = ['/messages'];

	$rootScope.getUser = AuthenticationService.getUser;

	$rootScope.$on('$routeChangeStart', function(event, next, current) {
		if( _(routesThatRequireAuth).contains($location.path()) && !AuthenticationService.isLoggedIn() ) {
			$location.path('/login');
			FlashService.show("Please log in to continue", "danger");
		}
	});
});