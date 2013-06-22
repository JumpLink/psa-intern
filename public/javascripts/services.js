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
		console.log(data);
		SessionService.set('authenticated', true);
		SessionService.set('name', data.name);
	};

	var uncacheSession = function() {
		SessionService.unset('authenticated');
		SessionService.unset('name');
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
		getName: function() {
			return SessionService.get('name');
		}
	}
});

app.factory("MessageService", function($http) {
	return {
		getLatest: function() {
			return $http.get('/messages/latest');
		},
		getNews: function(old_messages) {
			if(old_messages && old_messages.length > 0) {
				console.log(old_messages);
				var old_ids = []
				for (var i = 0; i < old_messages.length; i++) {
					old_ids[i] = old_messages[i].id
				};
				console.log(old_ids);
				return $http({
					method: 'GET',
					url: '/messages/news',
					params: {id: old_ids}
				});
			}

		}
	}
});