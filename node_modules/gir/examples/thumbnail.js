/* Copyright 2013 Jérémy Lal <kapouer@melix.org> - this file is released under MIT license until node-gir chooses a license. */
var gir = require('../gir');
var Gtk = gir.load('Gtk', '3.0');
var GdkPixbuf = gir.load('GdkPixbuf', '2.0');
var WebKit = gir.load('WebKit', '3.0');

function thumbPage(url, file, cb) {
	Gtk.init(0);
	var webSettings = new WebKit.WebSettings();
	webSettings.enablePlugins = false;
	webSettings.printBackgrounds = true;
	webSettings.enableScripts = false;

	var window = new Gtk.OffscreenWindow();
	var webView = new WebKit.WebView();
	window.add(webView);
	
	webView.set_maintains_back_forward_list(false);
	webView.set_settings(webSettings);
	webView.fullContentZoom = true;
	var atts = webView.get_viewport_attributes();
	atts.availableWidth = atts.desktopWidth = 1024;
	atts.availableHeight = atts.desktopHeight = 768;
	
	webView.on('load-finished', function() {
		var err, result;
		try {
			var pixBuf = window.get_pixbuf();
			pixBuf = pixBuf.scale_simple(320, (pixBuf.height * 320.0) / pixBuf.width, GdkPixbuf.InterpType.bilinear);
			result = pixBuf.savev(file, "png", [], []);
		} catch (ex) {
			err = ex;
		}
		Gtk.main_quit();
		cb(err, result);
	});
	webView.load_uri(url);
	window.show_all();
	Gtk.main();
}

thumbPage("http://google.fr", "./page.png", function(err, res) {
	if (err) console.error(err);
	else console.log("Done");
});
