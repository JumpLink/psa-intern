
/**
 * Module dependencies.
 */

var express = require ('express')
  , db = require ('./lib/db')
  , routes = {
  	messages: require ('./routes/messages').messages(db),
    users: require ('./routes/users').users(db)
  }
  , http = require ('http')
  , path = require ('path')
  , hash = require ('pwd-base64').hash
  , debug = require('debug')('app')
  , auth_debug = require('debug')('authenticate')
  , prerror = require('debug')('error')
  , util = require('util')
  , inspect = function (object) {return util.inspect(object, showHidden=false, depth=2, colorize=true);};

var app = express();

// set up the database
db.init(function (err) {
  if (err) throw err;
});

// all environments
app.set ('port', process.env.PORT || 1234);
app.set ('views', __dirname + '/views');
app.set ('view engine', 'jade');
app.use (express.favicon());
app.use (express.logger('dev'));
app.use (express.bodyParser());
app.use (express.methodOverride());
app.use (express.cookieParser('your secret here'));
app.use (express.session());
app.use (express.csrf());
app.use (app.router);
app.use (require('less-middleware')({ src: __dirname + '/public' }));
app.use (express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get ('env')) {
  app.use(express.errorHandler());
}

// Authenticate using our plain-object database of doom!

function authenticate (email, password, cb) {
  if (!module.parent) auth_debug('authenticating %s:%s', email, password);
  //var user = users[email];
  db.findUserByEmailForAuth(email, function(err, user) {
    if(err || !user) {
      return cb(new Error('cannot find user'));
    } else {
      auth_debug(user);
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

function restrict (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.json(401, {flash:'Please log in.'});
  }
}

/**
 * Routes that are always available
 */

app.get ('/', function (req, res){
  res.render('index', { csrf_token: req.session._csrf });
});
app.get ('/login.html', function (req, res){
  res.render ('login');
});
app.get ('/about.html', function (req, res){
  res.render('about');
});
app.get ('/user.html', function (req, res){
  res.render('user');
});
app.get ('/users.html', function (req, res){
  res.render('users');
});
app.get ('/messages.html', function (req, res){
  res.render('messages');
});
app.get ('/notfound.html', function (req, res){
  res.render('notfound');
});
app.get ('/loggedout.html', function (req, res){
  res.render('loggedout');
});
app.get ('/partials/userimage.html', function (req, res){
  res.render('partials/userimage');
});

app.get ('/auth/logout', function(req, res){

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
app.get ('/messages/latest', restrict, routes.messages.all);

app.get ('/messages/news', restrict, routes.messages.updates);

// TODO resize image?
app.post ('/upload/image', restrict, function(req, res) {
  // debug(inspect (req));
  var fs = require('fs');
  var mkdirp = require('mkdirp');
  var target_folder = __dirname+"/public/images/users"
  // get the temporary location of the file
  var tmp_path = req.files.file.path;
  // set where the file should actually exists - in this case it is in the "images" directory
  var target_path = target_folder+'/'+ req.headers['user_id'];
  mkdirp(target_folder, function (err) {
      if (err) prerror(inspect (err));
      else {
        // move the file from the temporary location to the intended location
        fs.rename(tmp_path, target_path, function(err) {
          if (err) prerror(inspect (err));
          // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
          fs.unlink(tmp_path, function() {
              if (err) throw err;
              res.send('File uploaded to: ' + target_path + ' - ' + req.files.file.size + ' bytes');
          });
        });
      }
  });
});

app.post ('/message', restrict, function(req, res) {
    var msg = {
      message: req.body.message,
      from: req.session.user.email,
      timestamp: new Date().toJSON()
    }

    db.saveMessage (msg, function (err, saved) {
      if (err || !saved) {
        res.json (500, {flash: "There was an error saving your message from: "+msg.from+", timestamp: "+msg.timestamp});
      } else {
        routes.messages.updates (req, res);
        //res.json(saved);
      }
    });
});

app.post ('/message/remove/:id', restrict, function(req, res) {
    debug(inspect({flash: "Removing the message with id: "+req.body._id}));
    db.removeMessage (req.body._id, function (err, numRemoved) {
      if (err) {
        res.json (500, {flash: "There was an error removing the message with id: "+req.body._id+" error: "+err, numRemoved: numRemoved});
      } else {
        routes.messages.updates (req, res);
      }
    });
});

// Create user
app.post ('/user', restrict, function(req, res) {
  var user = {
    email: req.body.email,
    name: req.body.name,
    color: req.body.color,
    created_from: req.session.user.email,
    timestamp: new Date().toJSON()
  }

  // when you create a user, generate a salt and hash the password
  hash (req.body.password, function(err, salt, hash){
    if (err)
      res.json (500, {flash: "There was an error saving the user: "+user.name});
    user.salt = salt;
    user.hash = hash;

    db.saveUser(user, function (err, saved) {
      if (err)
        res.json (500, {flash: "There was an error saving the user: "+user.name+" error: "+err});
      routes.users.updates (req, res);
    });
  });
});

// Change user
app.post ('/user/:email', restrict, function(req, res) {

  var user = {
    email: req.body.email,
    _id: req.body._id,
    name: req.body.name,
    color: req.body.color,
    created_from: req.session.user.email,
    timestamp: new Date().toJSON()
  }

  var update = function (user) {
    db.updateUserById(user._id, user, function (err, numReplaced, upsert) {
      debug(inspect({flash: "Updating the user: "+user.name, error: err, numReplaced: numReplaced, upsert: upsert}));
      if (err)
        res.json (500, {flash: "There was an error updating the user: "+user.name, numReplaced: numReplaced, upsert: upsert});
      res.json({flash: "User updated", numReplaced: numReplaced, upsert: upsert})
    });
  }

  if (typeof(req.body.password) != 'undefined' && req.body.password.length >= 6) {
    hash (req.body.password, function(err, salt, hash){
      if (err)
        res.json (500, {flash: "There was an error saving the user: "+user.name});
      user.salt = salt;
      user.hash = hash;

      update (user);
    });
  } else {
    update (user);
  }
});

// Remove user
app.post ('/user/remove/:id', restrict, function(req, res) {

  var remove = function (user_id) {
    db.removeUserById(user_id, function (err, numRemoved) {
      debug(inspect({flash: "Removing the user with id: "+user_id, numRemoved: numRemoved}));
      if (err)
        res.json (500, {flash: "There was an error removing the user with id: "+user_id, numRemoved: numRemoved});
      res.json({flash: "User removed", user_id: user_id, numRemoved: numRemoved, numRemoved: numRemoved})
    });
  }

  remove (req.body._id);
});

app.post ('/auth/login', function(req, res){

  authenticate(req.body.email, req.body.password, function(err, user){
    if (user) {
      auth_debug("user "+user.name+" übergeben");
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
        auth_debug(req.session.success);
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

app.get ('/user/:email', restrict, function (req, res) {
  db.findUserByEmail(req.params.email, function (error, user) {
    if(error || !user) {
      res.json( 500, {error:error} );
    } else {
      res.json( user );
    }
  });
});

app.get ('/users', restrict, function (req, res) {
  db.findUsers(function (error, results) {
    if(error || !results) {
      res.json( 500, {error:error} );
    } else {
      res.json( results );
    }
  });
});

http.createServer (app).listen (app.get ('port'), function (){
  debug ('Express server listening on port ' + app.get ('port'));
});