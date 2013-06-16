
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = {
  	files: require('./routes/files')
  }
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
//app.register('.html', require('jade'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res){
  res.render('index');
});

app.get('/login', function(req, res){
  res.render('login');
});
app.get('/home', function(req, res){
  res.render('home');
});
app.get('/files', function(req, res){
  res.render('files');
});
app.get('/expiry', function(req, res){
  res.json({flash:'all is good'});
  //res.json(401, {flash:'Your session has expired, please log in.'});
});


app.get('/files/pictures', routes.files.files);

app.post('/auth/login', function(req, res){
  if(req.body.username === 'JumpLink' && req.body.password === '123456') {
    res.json({username: 'JumpLink'});
  } else {
    res.json(500, {flash: 'Invalid user or password'});
  }
});

app.get('/auth/logout', function(req, res){
  //logout();
  res.json({flash: 'Logged Out!'});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});