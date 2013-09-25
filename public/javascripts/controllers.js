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

app.controller('UserController', function($scope, $routeParams, $location, UsersService, ImageUploadService, userImagePath, UserImageService, FlashService) {
	
	var clean_upload = function () {
		$scope.uploader.clearQueue ();
		$scope.progress_bar_style = {width: '0%'};
	}

	$scope.uploader = ImageUploadService.uploader;
	$scope.uploader.scope = $scope;
	$scope.email = $routeParams.email;

	clean_upload ();

	UsersService.getUser($scope.email, function(err, data) {
		if(err || !data) {
			$location.path("/notfound");
			//console.log(err);
		}	else {
			$scope.user = data;
		}
	});

	$scope.uploader.bind('progress', function (event, item, progress) {
		$scope.progress_bar_style = {width: progress+'%'};
	});

	$scope.uploader.bind('beforeupload', function (event, item) {
		item.headers = $scope.uploader.headers;
		item.headers['user_id'] = $scope.user._id;
	});

	$scope.uploader.bind('complete', function (event, xhr, item) {
		console.log ($scope.uploader);
		$scope.user.image_src = item.preview;
		clean_upload ();
		$scope.$apply();
	});

	$scope.changeUser = function () {
		UsersService.change ($scope.user).success (function (data) {
			// TODO find user with same id and show this in user view; handle error
			FlashService.show_response(data);
		});
	}

	$scope.removeUser = function () {
		UsersService.remove ($scope.user).success (function (data) {
			$location.path("/users");
			FlashService.show_response(data);
		}).error (function (data) {
			//$location.path("/users");
			FlashService.show_response(data);
		});
	}

});

app.controller('UsersController', function ($scope, UsersService, users, userImagePath, ColorService, FlashService) {

	$scope.users = users.data; // get users form resolve in app.js
	$scope.userImagePath = userImagePath;
	$scope.new_user = {
		color: ColorService.rand ()
	};
	$scope.sendUser = function () {
		UsersService.set ($scope.new_user).success (function (data) {
			FlashService.show_response(data);
			if (data && data.length > 0) {
				$scope.users = $scope.users.concat(data);
			}	
		}).error (function (data) {
			FlashService.show_response(data);
		});
	}
	// TODO requests vereinheitlichen, deferred/promise APIs besser verstehen und nutzen
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

app.controller('NavbarController', function($scope, $location, AuthenticationService, $translate) {
	$scope.isLoggedIn = AuthenticationService.isLoggedIn;

	$scope.isActive = function(route) {
		return route === $location.path();
	}

	$scope.lang_switch = false;

	var changeTranslate = function (key) {
		moment.lang(key); // TODO auslagern in eigenes AngularJS MomentJS-Modul
		$translate.uses(key).then(function (key) {	
			console.log("Sprache zu " + key + " gewechselt.");
		}, function (key) {
			console.log("Irgendwas lief schief.");
		});
	};

	var changeLanguage = function(boolean) {
		if (boolean) {
			changeTranslate ('de');
		} else {
			changeTranslate ('en');
		}
	}

	$scope.$watch('lang_switch', function(newValue, oldValue) {
		changeLanguage(newValue);
	});

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
			window.location.href = "/#/loggedout"; // WORKAROUND loads the site completly new to reset the csrf_token 
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

	$scope.removeMessage = function (message) {
		MessageService.remove (message).success (function (data) {
			//if (data && data.length > 0) {
				//$scope.messages = $scope.messages.concat(data);
			//}	
			$scope.messages = _.difference($scope.messages, message) // function from http://underscorejs.org/
		});
	}

	$scope.updateMessage = function (message) {
		MessageService.update (message).success (function (data) {
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