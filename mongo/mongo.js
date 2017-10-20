const mongodb = require('mongodb');
const settings = require('../settings/settings');
const mongodbClient = mongodb.MongoClient;

function dbMaker() {
  const address = {
    domain: settings.mongodbDomain,
    port: settings.mongodbPort,
    name: settings.mongodbName,
    auth: settings.mongodbAuth,
    username: settings.mongodbUsername,
    password: settings.mongodbPassword
  };

  const setUrl = function(domain, port, name) {
    if(domain)
      address.domain = domain;
    if(port)
      address.port = port;
    if(name)
      address.name = name;
  };

  const setAuth = function(username, password, authEnabled) {
    if(authEnabled !== undefined) {
      address.auth = authEnabled;
    }
    if(username)
      address.username = username;
    if(password)
      address.password = password;
  };

  const connect = function() {
    return new Promise(function(resolve, reject) {
      const authPart = address.auth ? (address.username + ':' + address.password + '@') : '';
      const dbPart = address.domain + ':' + address.port + '/' + address.name;
      const url = 'mongodb://' + authPart + dbPart + '?authSource=admin';
      mongodbClient.connect(url, function(err, db) {
        if(err) {
          console.error('[Mongodb] mongodb connection error', err);
          reject(err);
        }
        resolve(db);
        db.close();
      });
    });
  };

  return {
    setUrl,
    setAuth,
    connect
  };
}

module.exports = dbMaker;
