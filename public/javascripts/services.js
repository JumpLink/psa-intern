'use strict';

/* Services */

app.factory("AuthenticationService", function($location) {
	return {
		login: function(credentials) {
			if(credentials.username === "JumpLink") {
				$location.path("/home");
			}
		},
		logout: function() {
			$location.path("/login");
		} 
	}
})