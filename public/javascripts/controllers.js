'use strict';

/* Controllers */

app.controller('AboutController', function($scope) {

});

app.controller('LoginController', function($scope, $location, AuthenticationService) {
	$scope.credentials = { email: "", password: ""};

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

    $scope.visable = function(bool) {
    	if (bool)
	        return {
	            overflow: 'visible'
	        };
	    else
	    	return {
	            overflow: 'hidden'
	        };
    };

	$scope.logout = function() {
		AuthenticationService.logout().success(function() {
			window.location.href = "/"; //WORKAROUND loads the site completly new to reset the csrf_token 
			//$location.path("/login");
		});
	};
});

app.controller('MessageController', function($scope, $location, $timeout, AuthenticationService, MessageService, messages) {

	$scope.messages = messages.data;

	$scope.refreshMessages = function () {
		MessageService.getNews($scope.messages).success(function(data) {
			if(data && data.length > 0)
				$scope.messages = $scope.messages.concat(data);
		});
	};

	console.log(MessageService.getNews($scope.messages));

	$scope.refreshMessages();

    $scope.onTimeout = function(){
        $scope.refreshMessages();
        //console.log("nächste Runde");
        mytimeout = $timeout($scope.onTimeout,10000);
    }
    var mytimeout = $timeout($scope.onTimeout,10000);

    $scope.new_message = { message: "" };

    $scope.sendMessage = function(){
		MessageService.set($scope.new_message).success(function(data) {
			// $location.path('/messages');
		});
    	
    }
});

app.controller('TimeController', function($scope, $timeout) {
	$scope.now = new Date();
    $scope.onTimeout = function(){
        $scope.now = new Date();
        mytimeout = $timeout($scope.onTimeout,1000);
    }
    var mytimeout = $timeout($scope.onTimeout,1000);
});