var r = require('rethinkdb')
  , util = require('util')
  , assert = require('assert')
  , logdebug = require('debug')('rdb:debug')
  , logerror = require('debug')('rdb:error');


// #### Connection details

// RethinkDB database settings. Defaults can be overridden using environment variables.
var dbConfig = {
  host: process.env.RDB_HOST || 'localhost',
  port: parseInt(process.env.RDB_PORT) || 28015,
  db  : process.env.RDB_DB || 'psa_internal',
  tables: {
    'messages': 'id',
    'users': 'email'
  }
};

/**
 * Connect to RethinkDB instance and perform a basic database setup:
 *
 * - create the `RDB_DB` database (defaults to `psa_internal`)
 * - create tables `messages`, `users` in this database
 */
module.exports.setup = function() {
  r.connect({host: dbConfig.host, port: dbConfig.port }, function (err, connection) {
    assert.ok(err === null, err);
    r.dbCreate(dbConfig.db).run(connection, function(err, result) {
      if(err) {
        logdebug("[DEBUG] RethinkDB database '%s' already exists (%s:%s)\n%s", dbConfig.db, err.name, err.msg, err.message);
      }
      else {
        logdebug("[INFO ] RethinkDB database '%s' created", dbConfig.db);
      }

      for(var tbl in dbConfig.tables) {
        (function (tableName) {
          r.db(dbConfig.db).tableCreate(tableName, {primaryKey: dbConfig.tables[tbl]}).run(connection, function(err, result) {
            if(err) {
              logdebug("[DEBUG] RethinkDB table '%s' already exists (%s:%s)\n%s", tableName, err.name, err.msg, err.message);
            }
            else {
              logdebug("[INFO ] RethinkDB table '%s' created", tableName);
            }
          });
        })(tbl);
      }
    });
  });
};

// #### Filtering results

/**
 * Find a user by email using the 
 * [`filter`](http://www.rethinkdb.com/api/#js:selecting_data-filter) function. 
 * We are using the simple form of `filter` accepting an object as an argument which
 * is used to perform the matching (in this case the attribute `mail` must be equal to
 * the value provided). 
 *
 * We only need one result back so we use [`limit`](http://www.rethinkdb.com/api/#js:transformations-limit)
 * to return it (if found). Results are [`collect`](http://www.rethinkdb.com/api/#js:accessing_rql-collect)ed
 * and passed as an array to the callback function. 
 *
 * @param {String} mail
 *    the email of the user that we search for
 *
 * @param {Function} callback
 *    callback invoked after collecting all the results 
 * 
 * @returns {Object} the user if found, `null` otherwise 
 */
module.exports.findUserByEmailOld = function (mail, callback) {
  onConnect(function (err, connection) {
    logdebug("[INFO ][%s][findUserByEmail] Login {user: %s, pwd: 'you really thought I'd log it?'}", connection['_id'], mail);

    r.db(dbConfig.db).table('users').filter({'mail': mail}).limit(1).run(connection, function(err, cursor) {
      if(err) {
        logerror("[ERROR][%s][findUserByEmail][collect] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(err);
      }
      else {
        cursor.next(function (err, row) {
          if(err) {
            logerror("[ERROR][%s][findUserByEmail][collect] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
            callback(err);
          }
          else {
            callback(null, row);
          }
          connection.close();
        });
      }

    });
  });
};

/**
 * Find a user by email (this is the primary key) Retrieving
 * a document by its primary key can be done using the
 * [`get`](http://www.rethinkdb.com/api/#js:selecting_data-get) function.
 *
 * RethinkDB will use the primary key index to fetch the result.
 *
 * @param {String} email 
 *    The ID of the user to be retrieved.
 *
 * @param {Function} callback
 *    callback invoked after collecting all the results 
 * 
 * @returns {Object} the user if found, `null` otherwise
 */
module.exports.findUserByEmail = function (email, callback) {
  onConnect(function (err, connection) {
    r.db(dbConfig['db']).table('users').get(email).run(connection, function(err, result) {
      if(err) {
        logerror("[ERROR][%s][findUserByEmail] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(err, null);
      }
      else {
        callback(null, result);
      }
      connection.close();
    });    
  });
};

// #### Retrieving chat messages

/**
 * To find the last `max_results` messages ordered by `timestamp`,
 * we are using [`table`](http://www.rethinkdb.com/api/#js:selecting_data-table) to access
 * messages in the table, then we 
 * [`orderBy`](http://www.rethinkdb.com/api/#js:transformations-orderby) `timestamp` 
 * and instruct the server to return only `max_results` using 
 * [`limit`](http://www.rethinkdb.com/api/#js:transformations-limit).
 *
 * These operations are chained together and executed on the database. Results
 * are [`collect`](http://www.rethinkdb.com/api/#js:accessing_rql-collect)ed
 * and passed as an array to the callback function. 
 *
 *
 * @param {Number} max_results
 *    Maximum number of results to be retrieved from the db
 *
 * @param {Function} callback
 *    callback invoked after collecting all the results
 *
 * @returns {Array} an array of messages
 */
module.exports.findMessages = function (max_results, callback) {
  onConnect(function (err, connection) {
    r.db(dbConfig['db']).table('messages').orderBy(r.desc('timestamp')).limit(max_results).run(connection, function(err, cursor) {
      if(err) {
        logerror("[ERROR][%s][findMessages] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(err, []);
        connection.close();
      }
      else {
        cursor.toArray(function(err, results) {
          if(err) {
            logerror("[ERROR][%s][findMessages][toArray] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
            callback(err, []);
          }
          else {
            callback(null, results);
          }
          connection.close();
        });
      }
    });
  });
};


/**
 * To save a new chat message using we are using 
 * [`insert`](http://www.rethinkdb.com/api/#js:writing_data-insert). 
 *
 * An `insert` op returns an object specifying the number
 * of successfully created objects and their corresponding IDs:
 * `{ "inserted": 1, "errors": 0, "generated_keys": ["b3426201-9992-ab84-4a21-576719746036"] }`
 *
 * @param {Object} msg
 *    The message to be saved
 *
 * @param {Function} callback
 *    callback invoked once after the first result returned
 *
 * @returns {Boolean} `true` if the user was created, `false` otherwise 
 */
module.exports.saveMessage = function (msg, callback) {
  onConnect(function (err, connection) {
    r.db(dbConfig['db']).table('messages').insert(msg).run(connection, function(err, result) {
      if(err) {
        logerror("[ERROR][%s][saveMessage] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(err);
      }
      else {
        if(result.inserted === 1) {
          callback(null, true);
        }
        else {
          callback(null, false);
        }
      }
      connection.close();
    });
  });
};

/**
 * Adding a new user to database using  [`insert`](http://www.rethinkdb.com/api/#js:writing_data-insert).
 *
 * If the document to be saved doesn't have an `id` field, RethinkDB automatically
 * generates an unique `id`. This is returned in the result object.
 *
 * @param {Object} user
 *   The user JSON object to be saved.
 *
 * @param {Function} callback
 *    callback invoked once after the first result returned
 *
 * @returns {Boolean} `true` if the user was created, `false` otherwise
 */
module.exports.saveUser = function (user, callback) {  
  onConnect(function (err, connection) {
    r.db(dbConfig.db).table('users').insert(user).run(connection, function(err, result) {
      if(err) {
        logerror("[ERROR][%s][saveUser] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(err);
      }
      else {
        if (result.inserted === 1) {
          callback(null, true);
        }
        else {
          callback(null, false);
        }
      }
      connection.close();
    });
  });
};

// #### Helper functions

/**
 * A wrapper function for the RethinkDB API `r.connect`
 * to keep the configuration details in a single function
 * and fail fast in case of a connection error.
 */ 
function onConnect(callback) {
  r.connect({host: dbConfig.host, port: dbConfig.port }, function(err, connection) {
    assert.ok(err === null, err);
    connection['_id'] = Math.floor(Math.random()*10001);
    callback(err, connection);
  });
}

// #### Connection management
//
// This application uses a new connection for each query needed to serve
// a user request. In case generating the response would require multiple
// queries, the same connection should be used for all queries.
//
// Example:
//
//     onConnect(function (err, connection)) {
//         if(err) { return callback(err); }
//
//         query1.run(connection, callback);
//         query2.run(connection, callback);
//     }
//