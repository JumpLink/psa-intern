'use strict';

/* Services */

app.factory("FlashService", function($rootScope) {
	return {
		/* type = success | danger | info | warning */
		show: function(message, type) {
			if (typeof type === 'undefined') {
				type = "warning"
			}
			$rootScope.flash = {
				message: message,
				type: type
			};
		},
		clear: function() {
			$rootScope.flash = {};
		}
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
	};

	var uncacheSession = function() {
		SessionService.unset('authenticated');
		SessionService.unset('name');
		SessionService.unset('email');
	};

	var loginError = function(response) {
		FlashService.show(response.flash, "danger")
	};

	var sanitizeCredentials = function(credentials) {
		return {
			email: $sanitize(credentials.email),
			password: $sanitize(credentials.password),
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
				email: SessionService.get('email')
			}
		}
	}
});

app.factory("MessageService", function($http, $sanitize, CSRF_TOKEN) {

	var sanitizeMessagePost = function(new_message) {
		return {
			message: $sanitize(new_message.message),
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
				if(mes_a[a].id === mes_b[b].id) {
					found_id = true;
				}
			};
			if(!found_id) {
				result.push(mes_a[a]);
			}
		};
		return result;
	}

	var getLatest = function() {
		return $http.get('/messages/latest');
	};

	/*
	 * use "getLatest()" and saves the new messages they are not curently in "stored_messages"
	 */
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
	var getNewsFromServer = function() {
		return $http.get('/messages/news');
	};

	var set = function(new_message) {
		var new_message_result = $http.post("/message", sanitizeMessagePost(new_message));
		return new_message_result;
	};

	return {
		getLatest: getLatest,
		getNews: getNews,
		set: set
	}
});

app.factory("UserService", function($http) {
	var getUser = function() {
		return $http.get('/users');
	};
});