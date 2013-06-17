'use strict';

/* Controllers */

app.controller('LoginController', function($scope, $location, AuthenticationService) {
	$scope.credentials = { username: "", password: ""};

	$scope.login = function() {
		AuthenticationService.login($scope.credentials).success(function() {
			$location.path('/files');
		});
	};
});

app.controller('HomeController', function($scope, $location, AuthenticationService) {

});

app.controller('FilesController', function($scope, $location, AuthenticationService, files) {

	$scope.files = files.data;

	$scope.logout = function() {
		AuthenticationService.logout().success(function() {
			$location.path("/login");
		});
	}
});