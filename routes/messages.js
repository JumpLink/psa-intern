module.exports.messages = function (db) {
	return {
		latest : function(req, res) {
			var max_results = 50;
			db.findMessages(max_results , function(error, messages) {
				if(error || messages === []) {
					res.json( { error: error } );
				} else {
					res.json( messages );
				}
				
			})
		},
		news : function(req, res) {
			var max_results = 10;
			var old_ids = req.query.id;
			db.findNewMessages(max_results, old_ids , function(error, messages) {
			if(error || messages === []) {
				res.json( { error: error } );
				//console.log(error);
			} else {
				res.json( messages );
				//console.log(messages);
			}

			})
		}
	}
}