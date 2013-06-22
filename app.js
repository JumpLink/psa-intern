
/**
 * Module dependencies.
 */

var express = require('express')
  , db = require('./lib/db')
  , routes = {
  	messages: require('./routes/messages').messages(db)
  }
  , http = require('http')
  , path = require('path')
  , hash = require('pwd-base64').hash;

var app = express();

// set up the RethinkDB database
db.setup();

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

// Authenticate using our plain-object database of doom!

function authenticate(email, password, cb) {
  if (!module.parent) console.log('authenticating %s:%s', email, password);
  //var user = users[email];
  db.findUserByEmail(email, function(err, user) {
    if(err || !user) {
      return cb(new Error('cannot find user'));
    } else {
      // apply the same algorithm to the POSTed password, applying
      // the hash against the pass / salt, if there is a match we
      // found the user
      hash(password, user.salt, function(err, hash){
        if (err) return cb(err);
        if (hash == user.hash){
          //All right
          return cb(null, user);
        }
        cb(new Error('invalid password'));
      })
    }
  }); 
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

app.get('/messages/latest', routes.messages.latest);

app.get('/messages/news', routes.messages.news);

app.post('/message', function(req, res) {
    var msg = {
      message: req.body.message,
      from: req.session.user.email,
      timestamp: new Date().toJSON()
    }

    db.saveMessage(msg, function (err, saved) {
      if (err || !saved) {
        res.json(500, {flash: "There was an error saving your message from: "+msg.from+", timestamp: "+msg.timestamp});
      } else {
        res.json(msg);
      }
    });
})

app.post('/user', function(req, res) {

  //TODO

  // dummy database
  var users = {
    "jumplink@gmail.com": { name: 'JumpLink' },
    "cp@rimtest.de": { name: 'Pfeil' }
  };

  // when you create a user, generate a salt
  // and hash the password ('foobar' is the pass here)

  hash('123456', function(err, salt, hash){
    if (err) throw err;
    users["jumplink@gmail.com"].salt = salt;
    users["jumplink@gmail.com"].hash = hash;
  });

  hash('rimtest', function(err, salt, hash){
    if (err) throw err;
    users["cp@rimtest.de"].salt = salt;
    users["cp@rimtest.de"].hash = hash;
  });
});

app.post('/auth/login', function(req, res){

  authenticate(req.body.email, req.body.password, function(err, user){
    if (user) {
      console.log("user "+user.name+" übergeben");
      // Regenerate session when signing in
      // to prevent fixation
      var csrf_token = req.session._csrf; // DO not override csrf_token
      req.session.regenerate(function(){
        req.session._csrf = csrf_token;
        // Store the user's primary key 
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = user;
        req.session.success = 'Authenticated as ' + user.name
          + ' click to <a href="/logout">logout</a>. '
          + ' You may now access <a href="/restricted">/restricted</a>.';
        console.log(req.session.success);
        res.json(user);
      });
    } else {
      req.session.error = 'Authentication failed, please check your '
        + ' email and password.'
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