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
	var cacheSession = function() {
		SessionService.set('authenticated', true);
	};

	var uncacheSession = function() {
		SessionService.unset('authenticated');
	};

	var loginError = function(response) {
		FlashService.show(response.flash, "danger")
	};

	var sanitizeCredentials = function(credentials) {
		return {
			username: $sanitize(credentials.username),
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
		}
	}
});

app.factory("FileService", function($http) {
  return {
    get: function() {
      return $http.get('/files');
    }
  };
});