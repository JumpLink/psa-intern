'use strict';

/* Services */

app.factory("ColorService", function() {
	chroma.rand = function() {return '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);}
	return chroma;
});

app.factory("FlashService", function($rootScope) {
	/* type = success | danger | info | warning */
	var show = function(message, type) {
		if (typeof type === 'undefined') {
			type = "warning"
		}
		$rootScope.flash = {
			message: message,
			type: type
		};
	};
	var show_response = function(response) {
		if(typeof(response) != 'undefined' && response != null) {
			var message = 'error undefined flash message';
			var type = 'danger';
			if(typeof(response.flash) != 'undefined' && response.flash != null && response.flash.length > 0)
				message = response.flash;
			else if(typeof(response.error) != 'undefined' && response.error != null && response.error.length > 0)
				message = response.error;
			else if(typeof(response.err) != 'undefined' && response.err != null && response.err.length > 0)
				message = response.err;

			if(typeof(response.type) != 'undefined' && response.type != null && response.type.length > 0)
				type = response.type;

			show(message, type);
		}
	};
	var clear = function() {
		$rootScope.flash = {};
	};
	return {
		show: show,
		show_response: show_response,
		clear: clear
	};
});

app.factory("SessionService", function() {
	return {
		get: function(key) {
			return sessionStorage.getItem(key);
		},
		set: function(key, val) {
			return sessionStorage.setItem(key, val);
		},
		unset: function(key) {
			return sessionStorage.removeItem(key);
		},
	};
});

app.factory("AuthenticationService", function($http, $sanitize, SessionService, FlashService, CSRF_TOKEN) {
	var cacheSession = function(data, status, headers, config) {
		SessionService.set('authenticated', true);
		SessionService.set('name', data.name);
		SessionService.set('email', data.email);
		SessionService.set('color', data.color);
		SessionService.set('_id', data._id);
	};

	var uncacheSession = function() {
		SessionService.unset('authenticated');
		SessionService.unset('name');
		SessionService.unset('email');
		SessionService.unset('color');
		SessionService.unset('_id');
	};

	var loginError = function(response) {
		FlashService.show_response(response);
	};

	var sanitizeCredentials = function(credentials) {
		return {
			email: $sanitize(credentials.email),
			password: $sanitize(credentials.password),
			_id: $sanitize(credentials._id),
			_csrf: CSRF_TOKEN
		}
	};

	return {
		login: function(credentials) {
			var login = $http.post("/auth/login", sanitizeCredentials(credentials));
			login.success(cacheSession);
			login.success(FlashService.clear);
			login.error(loginError);
			return login;
		},
		logout: function() {
			var logout = $http.get("/auth/logout");
			logout.success(uncacheSession);
			return logout;
		},
		isLoggedIn: function() {
			return SessionService.get('authenticated');
		},
		getUser: function() {
			return {
				name: SessionService.get('name'),
				email: SessionService.get('email'),
				color: SessionService.get('color'),
				_id: SessionService.get('_id')
			}
		}
	}
});

app.factory("MessageService", function($http, $sanitize, CSRF_TOKEN) {

	var sanitizeMessagePost = function(new_message) {
		return {
			message: $sanitize(new_message.message),
			_id: $sanitize(new_message._id),
			_csrf: CSRF_TOKEN
		}
	};

	/*
	 * Return messages from mes_a they are not stored in mes_b
	 */
	var not_in = function(mes_a, mes_b) {
		var result = []
		for (var a = 0; a < mes_a.length; a++) {
			var found_id = false;
			for (var b = 0; b < mes_b.length; b++) {
				if(mes_a[a]._id === mes_b[b]._id) {
					found_id = true;
				}
			};
			if(!found_id) {
				result.push(mes_a[a]);
			}
		};
		return result;
	}
	// TODO requests vereinheitlichen, deferred/promise APIs besser verstehen und nutzen
	var getLatest = function() {
		return $http.get('/messages/latest');
	};

	/*
	 * use "getLatest()" and saves the new messages they are not curently in "stored_messages"
	 */
	// TODO requests vereinheitlichen, deferred/promise APIs besser verstehen und nutzen
	var getNews = function(stored_messages, cb) {
		getLatest().success(function(mes) {
			if(stored_messages === []) {
				cb(null, mes);
			} else {
				cb(null, not_in(mes, stored_messages));
				return;
			}
		});
		return;
	};

	/*
	 * Return new messages processed from server
	 */
	// TODO requests vereinheitlichen, deferred/promise APIs besser verstehen und nutzen
	var getNewsFromServer = function() {
		return $http.get('/messages/news');
	};

	var set = function(new_message) {
		var new_message_result = $http.post("/message", sanitizeMessagePost(new_message));
		return new_message_result;
	};

	var update = function(new_message) {
		var error = "Diese Funktion steht noch nicht zur Verfügung"
		alert(error);
		console.log(error);
		console.log(new_message);

		var new_message_result = $http.post("/message/"+new_message._id, sanitizeMessagePost(new_message));
		return new_message_result;
	};

	var remove = function(old_message) {
		var new_message_result = $http.post("/message/remove/"+old_message._id, sanitizeMessagePost(old_message));
		return new_message_result;
	};

	return {
		getLatest: getLatest,
		getNews: getNews,
		set: set,
		update: update,
		remove: remove
	}
});

app.factory("UsersService", function($http, $sanitize, CSRF_TOKEN, ColorService) {

	var sanitizeUser = function(user) {
		return {
			email: $sanitize(user.email),
			password: $sanitize(user.password),
			name: $sanitize(user.name),
			color:  $sanitize(user.color),
			_id: $sanitize(user._id),
			_csrf: CSRF_TOKEN
		}
	};
	// TODO requests vereinheitlichen, deferred/promise APIs besser verstehen und nutzen
	var getUsers = function(cb) {
		return $http.get('/users');
/*		return $http.get('/users').success(function(data) {
			if(data.error) {
				cb(data.error, null);
			} else {
				cb(null, data);
				return;
			}
		});*/
	};

	var getUserError = function(response) {
		FlashService.show_response(response);
	};

	// TODO requests vereinheitlichen, deferred/promise APIs besser verstehen und nutzen
	var getUser = function(email, cb) {
		return $http.get('/user/'+email).success(function(data) {
			if(data.error) {
				getUserError(data);
				cb(data.error, null);
			} else {
				if(!data.color || data.color == undefined || data.color == "" || data.color == "") {
					data.color = ColorService.rand ();
				}
				cb(null, data);
				return;
			}
		}).error(function(data, status, headers, config) {
			getUserError(data);
			cb(data.error, null);
		});;
	};
	var set = function(new_user) {
		var new_users_result = $http.post("/user", sanitizeUser(new_user));
		return new_users_result;
	};

	var change = function(user) {
		var user_result = $http.post("/user/"+user.email, sanitizeUser(user));
		return user_result;
	};

	var remove = function(user) {
		var user_result = $http.post("/user/remove/"+user._id, sanitizeUser(user));
		return user_result;
	};

	return {
		getUsers: getUsers,
		getUser: getUser,
		set: set,
		change: change,
		remove: remove
	}
});

app.factory("UserImageService", function(userImagePath, $http) {

	/*
	 * callback (boolean) true if image exists; false if image not exists
	 */
	var image_exists = function (url, cb) {
		$http.head(url)
		.success(function (data, status, headers, config) {
			console.log("images exists");
			cb (true);
			// this callback will be called asynchronously
			// when the response is available
		})
		.error(function(data, status, headers, config) {
			console.log("images not exists");
			cb (false);
			// called asynchronously if an error occurs
			// or server returns response with an error status.
		})
	};

	/*
	 * callback (string) image url for image src or null if image not exists
	 */
	var img_src = function(image_id, cb) {
		var url = userImagePath+"/"+image_id;
		image_exists(url, function (exists) {
			if (exists)
				cb (url);
			else
				cb (null);
		});
	};

	return {
		image_exists: image_exists,
		img_src: img_src
	};
});

app.factory("ImageUploadService", function($fileUploader, $sanitize, CSRF_TOKEN) {


	// create a uploader with options
	var uploader = $fileUploader.create({
    //scope: $scope,                          // to automatically update the html. Default: $rootScope
    url: 'upload/image',
    headers: {'x-csrf-token': CSRF_TOKEN},
    filters: [
        function (item) {                    // first user filter
            console.log('filter1');
            return true;
        }
    ]
	});

	// ADDING FILTER

	uploader.filters.push(function (item) { // second user filter
	    console.log('filter2');
	    return true;
	});

	// REGISTER HANDLERS

	uploader.bind('afteraddingfile', function (event, item) {
    console.log('After adding a file', item);
    // Only process image files.
    if (item.file.type.match('image.*')) {
			// Check for the various File API support.
			if (window.File && window.FileReader && window.FileList && window.Blob) {
			  // Great success! All the File APIs are supported.
		    var reader = new FileReader();
				reader.onload = function (e) {
					console.log(e.target.result);
					item.preview = e.target.result;
					uploader.scope.$apply();
				}
				reader.readAsDataURL(item.file);
			} else {
			  console.log('The File APIs are not fully supported in this browser.');
			}
		} else {
			console.log('Only image files supported.');
			item.remove();
		}
	});

	uploader.bind('afteraddingall', function (event, items) {
	    console.log('After adding all files', items);
	});

	uploader.bind('changedqueue', function (event, items) {
	    console.log('Changed queue', items);
	});

	uploader.bind('beforeupload', function (event, item) {
    console.log('Before upload', item);
	});

	uploader.bind('progress', function (event, item, progress) {
	    console.log('Progress: ' + progress);
	});

	uploader.bind('success', function (event, xhr, item) {
	    console.log('Success: ' + xhr.response);
	});

	uploader.bind('complete', function (event, xhr, item) {
	    console.log('Complete: ' + xhr.response);
	});

	uploader.bind('progressall', function (event, progress) {
	    console.log('Total progress: ' + progress);
	});

	uploader.bind('completeall', function (event, items) {
	    console.log('All files are transferred');
	});

	return {
		uploader: uploader
	}
});