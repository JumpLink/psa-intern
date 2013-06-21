
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = {
  	messages: require('./routes/messages').messages
  }
  , http = require('http')
  , path = require('path')
  , hash = require('pwd-base64').hash;

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(express.csrf());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// dummy database

var users = {
  JumpLink: { name: 'JumpLink' }
};

// when you create a user, generate a salt
// and hash the password ('foobar' is the pass here)

hash('123456', function(err, salt, hash){
  if (err) throw err;
  users.JumpLink.salt = salt;
  users.JumpLink.hash = hash;
});

// Authenticate using our plain-object database of doom!

function authenticate(name, password, cb) {
  if (!module.parent) console.log('authenticating %s:%s', name, password);
  var user = users[name];
  // query the db for the given username
  if (!user) return cb(new Error('cannot find user'));
  // apply the same algorithm to the POSTed password, applying
  // the hash against the pass / salt, if there is a match we
  // found the user
  hash(password, user.salt, function(err, hash){
    if (err) return cb(err);
    if (hash == user.hash) return cb(null, user);
    cb(new Error('invalid password'));
  })
}

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.json(401, {flash:'Please log in.'});
  }
}

app.get('/', function(req, res){
  res.render('index', { csrf_token: req.session._csrf });
});
app.get('/login.html', function(req, res){
  res.render('login');
});
app.get('/about.html', function(req, res){
  res.render('about');
});

app.get('/messages', routes.messages);

app.post('/auth/login', function(req, res){

  authenticate(req.body.username, req.body.password, function(err, user){
    if (user) {
      // Regenerate session when signing in
      // to prevent fixation 
      req.session.regenerate(function(){
        // Store the user's primary key 
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = user;
        req.session.success = 'Authenticated as ' + user.name
          + ' click to <a href="/logout">logout</a>. '
          + ' You may now access <a href="/restricted">/restricted</a>.';
        res.json(user);
      });
    } else {
      req.session.error = 'Authentication failed, please check your '
        + ' username and password.'
        + ' (use "tj" and "foobar")';
      res.json(500, {flash: 'Invalid user or password'});
    }
  });

});

app.get('/auth/logout', function(req, res){

  // destroy the user's session to log them out
  // will be re-created next request
  // req.session.destroy(function(){
  //   res.json({flash: 'Logged Out!', new_csrf_token: req.session._csrf});
  // });

  delete req.session.user;
  delete req.session.success;
  res.json({flash: 'Logged Out!'});
 
});

/**
 * Routes that are only avable if a user is logged in
 */
app.get('/messages.html', restrict, function(req, res){
  res.render('messages');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});