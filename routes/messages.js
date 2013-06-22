module.exports = function (db) {
	return {
		messages : function(req, res) {
			var max_results = 100;
			db.findMessages(max_results , function(error, messages) {
				if(error || messages ==[]) {
					res.json( { error: error } );
				} else {
					res.json( messages );
				}
				
			})
		}
	}
}