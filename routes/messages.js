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

	/*
	 * Get all Messages from DB
	 */
	var getFromDB = function(cb) {
		db.findMessagesWithUsername(function(error, messages) {
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
			getFromDB (function(err, mes) {
				if( err || !mes ) {
					res.json( 500, { error: err } );
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
			getFromDB (function(err, mes) {
				if( err || !mes ) {
					res.json( 500, { error: err } );
				} else {
					if(stored_messages === []) {
						stored_messages = mes;
					} else {
						var diff = not_in (mes, stored_messages);
						stored_messages = stored_messages.concat (diff);
						res.json (diff);
					}
				}
			});
		}
	}
}