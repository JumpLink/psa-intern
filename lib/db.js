var Datastore = require('nedb')
  , util = require('util')
  , assert = require('assert')
  , logdebug = require('debug')('rdb:debug')
  , logerror = require('debug')('rdb:error')
  , async = require('async')
  , DB_PATH = "database";

var db = {
  users : new Datastore({ filename: DB_PATH + '/users.db', autoload: true }),
  messages : new Datastore({ filename: DB_PATH + '/messages.db', autoload: true }),
}

db.users.ensureIndex({ fieldName: 'email', unique: true }, function (err) {
  if (err) {
    console.log (err);
  }
});

module.exports.findUserByEmail = function (email, callback) {
  db.users.findOne({ email: email }, callback);
};

module.exports.findUsers = function (callback) {
  db.users.find({}, callback);
};

module.exports.findMessages = function (callback) {
  db.messages.find({}, callback);
};

module.exports.getUsernameForMessage = function (message, callback) {
  module.exports.findUserByEmail (message.from, function (err, user) {
    if (!err && user) {
      message.name = user.name;
      callback (err, message);
    } else {
      callback (err, null);
    }
  });
}

module.exports.getUsernamesForMessages = function (messages, callback) {
  async.map( messages, module.exports.getUsernameForMessage, callback);
}

module.exports.findMessagesWithUsername = function (callback) {
  async.waterfall([
    module.exports.findMessages,
    module.exports.getUsernamesForMessages
  ], callback);
};

module.exports.saveMessage = function (msg, callback) {
  db.messages.insert(msg, callback);
};

module.exports.saveUser = function (user, callback) {  
  db.users.insert(user, callback);
};

module.exports.updateUser = function (email, user, callback) {  
  db.users.update({ email: email }, user, {}, callback);
};