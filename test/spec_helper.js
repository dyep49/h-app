var chaiAsPromised = require('chai-as-promised');

module.exports = function() {
  global.chai = require('chai');
  global.chai.use(chaiAsPromised);
  global.should = chai.should();

  process.env.NODE_ENV = 'test'
}

