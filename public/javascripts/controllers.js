'use strict';

/* Controllers */

app.controller('AboutController', function($scope) {

});

app.controller('LoginController', function($scope, $location, AuthenticationService) {
	$scope.credentials = { username: "", password: ""};

	$scope.login = function() {
		AuthenticationService.login($scope.credentials).success(function() {
			$location.path('/messages');
		});
	};
});

app.controller('NavbarController', function($scope, $location, AuthenticationService) {
	$scope.isLoggedIn = AuthenticationService.isLoggedIn;

	$scope.isActive = function(route) {
		return route === $location.path();
	}

	$scope.logout = function() {
		AuthenticationService.logout().success(function() {
			window.location.href = "/"; //WORKAROUND loads the site completly new to reset the csrf_token 
			//$location.path("/login");
		});
	};
});

app.controller('MessageController', function($scope, $location, AuthenticationService, messages) {
	$scope.messages = messages.data;
});