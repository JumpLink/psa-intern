var fs = require('fs');
/*
 * GET users listing.
 */

// var Gir = require('gir');
// var Gio = Gir.load('Gio', '2.0');
// console.log(Gio);
//f = Gio.File(path=process.env['HOME']+'/Bilder/Bildschirmfoto vom 2013-06-02 18:17:58.png');

exports.files = function(req, res){
	fs.readdir(process.env['HOME'], function(err, files) {
		res.json(files);
	});
	
};