module.exports.users = function (db) {

	var stored_users = [];

	/*
	 * Return users from users_a they are not stored in users_b
	 */
	var not_in = function(users_a, users_b) {
		var result = [];
		for (var a = 0; a < users_a.length; a++) {
			var found_id = false;
			for (var b = 0; b < users_b.length; b++) {
				
				if(users_a[a].email === users_b[b].email) {
					found_id = true;
				}
			};
			if(!found_id) {
				result.push(users_a[a]);
			}
		};
		return result;
	}

	/*
	 * Get all users from DB
	 */
	var getFromDB = function(cb) {
		db.findUsers(function(error, users) {
			if(error || users === []) {
				cb(error, null);
			} else {
				cb(null, users);
			}
			
		});
	};

	return {
		/*
		 * use "getFromDB" and replaces "stored_users" with the result
		 */
		all : function(req, res) {
			getFromDB (function(err, usrs) {
				if( err || !usrs ) {
					res.json( 500, { error: err } );
				} else {
					stored_users = usrs;
					res.json( usrs );
				}
			});
		},
		/*
		 * use "getFromDB" and saves the new users they are not curently in "stored_users"
		 */
		updates : function(req, res) {
			getFromDB (function(err, usrs) {
				if( err || !usrs ) {
					res.json( 500, { error: err } );
				} else {
					if(stored_users === []) {
						stored_users = usrs;
					} else {
						var diff = not_in (usrs, stored_users);
						stored_users = stored_users.concat (diff);
						res.json (diff);
					}
				}
			});
		}
	}
}