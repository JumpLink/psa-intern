'use strict';

/* Controllers */

app.controller('FileCtrl', function($scope) {
    $scope.files = [
		"Bildschirmfoto vom 2013-06-02 18:17:58.png",
		"Bildschirmfoto vom 2013-06-02 18:19:40.png",
		"Bildschirmfoto vom 2013-06-02 18:22:54.png",
		"Bildschirmfoto vom 2013-06-02 23:42:55.png",
		"Bildschirmfoto vom 2013-06-03 17:42:28.png",
		"Bildschirmfoto vom 2013-06-04 16:08:48.png",
		"Bildschirmfoto vom 2013-06-05 11:12:53.png",
		"Bildschirmfoto vom 2013-06-05 13:57:34.png",
		"Wallpapers",
		"arbeit",
		"privat"
	];
});

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

app.controller('FilesController', function($scope, $location, AuthenticationService, expiry) {

	$scope.expiry = expiry.data;

	$scope.logout = function() {
		AuthenticationService.logout().success(function() {
			$location.path("/login");
		});
	}
});