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

module.exports.init = function (callback) {
  db.users.ensureIndex({ fieldName: 'email', unique: true }, callback);
};

module.exports.findUserByEmailForAuth = function (email, callback) {
  db.users.findOne({ email: email }, callback);
};

var removeAuth = function (user) {
  delete user.hash;
  delete user.salt;
  return user;
}

module.exports.findUserByEmail = function (email, callback) {
  module.exports.findUserByEmailForAuth (email, function (err, usr) {
    callback(err, removeAuth(usr));
  });
};

// TODO remove hash and salt
module.exports.findUsers = function (callback) {
  db.users.find({}, callback);
};

module.exports.findMessages = function (callback) {
  db.messages.find({}, callback);
};

module.exports.getUsernameForMessage = function (message, callback) {
  module.exports.findUserByEmail (message.from, function (err, user) {
    if (!err && user) {
      message.author = user;
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

module.exports.updateMessage = function (_id, new_message, callback) {  
  db.messages.update({ _id: _id }, new_message, {}, callback);
};

module.exports.removeMessage = function (id, callback) {
  db.messages.remove({_id: id}, {}, callback);
};

module.exports.saveUser = function (user, callback) {  
  db.users.insert(user, callback);
};

module.exports.updateUser = function (email, user, callback) {  
  db.users.update({ email: email }, user, {}, callback);
};

module.exports.updateUserById = function (_id, user, callback) {  
  db.users.update({ _id: _id }, user, {}, callback);
};

module.exports.removeUserById = function (id, callback) {  
  db.users.remove({ _id: id }, {}, callback);
};