'use strict';

/* Filters */

// TODO auslagern in eigenes AngularJS MomentJS-Modul
app.filter('fromNow', function() {
	return function(timestamp) {
		return moment(timestamp).fromNow()
	};
});