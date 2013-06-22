'use strict';

/* Filters */
app.filter('fromNow', function() {
	return function(timestamp) {
		return moment(timestamp).fromNow()
	};
});