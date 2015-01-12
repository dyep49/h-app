var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'hackerati-app'
    },
    port: 4000,
    db: 'mongodb://localhost/hackerati-app-development'
    
  },

  test: {
    root: rootPath,
    app: {
      name: 'hackerati-app'
    },
    port: 4000,
    db: 'mongodb://localhost/hackerati-app-test'
    
  },

  production: {
    root: rootPath,
    app: {
      name: 'hackerati-app'
    },
    port: process.env.PORT,
    db: process.env.MONGO_URL
    
  }
};

module.exports = config[env];