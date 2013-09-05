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

app.controller('UserController', function($scope, $routeParams, UsersService, ImageUploadService, userImagePath) {
	$scope.email = $routeParams.email;
	$scope.userImagePath = userImagePath;
	UsersService.getUser($scope.email, function(err, data) {
		if(err || !data)
			console.log(err);
		else {
			$scope.user = data;

		}
	});

	$scope.uploader = ImageUploadService.uploader;
	$scope.uploader.scope = $scope;


	$scope.uploader.bind('progress', function (event, item, progress) {
	   $scope.progress_bar_style = {width: progress+'%'};
	});

	$scope.uploader.bind('beforeupload', function (event, item) {
    item.headers = $scope.uploader.headers;
    item.headers['user_id'] = $scope.user._id;
	});

});

app.controller('UsersController', function ($scope, UsersService, users, userImagePath) {

	$scope.users = users.data; // get users form resolve in app.js
	$scope.userImagePath = userImagePath;

  $scope.sendUser = function () {
		UsersService.set ($scope.new_user).success (function (data) {
			if (data && data.length > 0) {
				$scope.users = $scope.users.concat(data);
			}	
		});
  }

  $scope.getUsers = function () {
		UsersService.getUsers(function(err, data) {
			if(err || !data)
				console.log(err);
			else {
				console.log(data);
				$scope.users = data;
			}
		});
  }
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
			window.location.href = "/#/loggedout"; //WORKAROUND loads the site completly new to reset the csrf_token 
			//$location.path("/login");
		});
	};

	$scope.login = function() {
		$location.path('/login');
	};
});

app.controller('MessageController', function($scope, $location, $timeout, AuthenticationService, MessageService, messages, userImagePath) {

	$scope.messages = messages.data; // get messages form resolve in app.js
	$scope.userImagePath = userImagePath;

	$scope.refreshMessages = function () {
		// MessageService.getNewsFromServer().success(function(data) {
		// 	if(data && data.length > 0)
		// 		$scope.messages = $scope.messages.concat(data);
		// });
		MessageService.getNews($scope.messages, function(err, data) {
			if(err || !data)
				console.log(err);
			else 
				$scope.messages = $scope.messages.concat(data);
		});
	};

	$scope.refreshMessages();

    $scope.onRefresh = function(){
      $scope.refreshMessages();
      refresh_timeout = $timeout($scope.onRefresh,10000);
    }
    var refresh_timeout = $timeout($scope.onRefresh,10000);

    $scope.new_message = { message: "" };

    $scope.sendMessage = function () {
			MessageService.set ($scope.new_message).success (function (data) {
				if (data && data.length > 0) {
					$scope.new_message.message = "";
					$scope.messages = $scope.messages.concat(data);
				}	
			});
    }
});

app.controller('TimeController', function($scope, $timeout) {
	$scope.now = new Date();
    $scope.onRefreshSecond = function(){
      $scope.now = new Date();
      timer_timeout = $timeout($scope.onRefreshSecond,1000);
    }
    var timer_timeout = $timeout($scope.onRefreshSecond,1000);
});