module.exports.messages = function (db) {

	var stored_messages = [];

	/*
	 * Return messages from mes_a they are not stored in mes_b
	 */
	var not_in = function(mes_a, mes_b) {
		var result = [];
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

	/*
	 * Get all Messages from DB with maximum "max" results
	 */
	var getFromDB = function(max, cb) {
		db.findMessagesWithUsername(max , function(error, messages) {
			if(error || messages === []) {
				cb(error, null);
			} else {
				cb(null, messages);
			}
			
		});
	};

	/*
	 * Get all Messages from witout the ids "ids"
	 */
	var getNewsFromDB = function(max, ids, cb) {
		db.findNewMessages(max, ids , function(error, messages) {
			if(error || messages === []) {
				cb(error, null);
			} else {
				cb(null, messages);
			}
		});
	};

	return {
		/*
		 * use "getFromDB" and replaces "stored_messages" with the result
		 */
		all : function(req, res) {
			var max = 50;
			getFromDB (max, function(err, mes) {
				if( err || !mes ) {
					res.json( { error: err } );
				} else {
					stored_messages = mes;
					res.json( mes );
				}
			});
		},
		/*
		 * use "getFromDB" and saves the new messages they are not curently in "stored_messages"
		 */
		updates : function(req, res) {
			var max = 10;
			getFromDB (max, function(err, mes) {
				if( err || !mes ) {
					res.json( { error: err } );
				} else {
					if(stored_messages === []) {
						stored_messages = mes;
					} else {
						var diff = not_in(mes, stored_messages);
						stored_messages = stored_messages.concat(diff);
						res.json( diff );
					}

				}
			});
		}
	}
}