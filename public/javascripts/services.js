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

app.factory("AuthenticationService", function($http, $location, SessionService, FlashService) {
	var cacheSession = function() {
		SessionService.set('authenticated', true);
	};
	var uncacheSession = function() {
		SessionService.unset('authenticated');
	};

	var loginError = function(response) {
		FlashService.show(response.flash, "danger")
	}

	return {
		login: function(credentials) {
			var login = $http.post("/auth/login", credentials);
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
})