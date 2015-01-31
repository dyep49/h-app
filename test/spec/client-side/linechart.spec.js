var benv = require('benv');
var config = require('../../../config/config.js');
var lineChart = require('../../../public/src/scripts/linechart.js');

describe('dashboard', function() {

  beforeEach(function(done) {
    benv.setup(function() {
      benv.expose({
        $: require('jquery')
      })
      done();
    });
  });

  afterEach(function() {
    benv.teardown();
  });

  it('has window object', function() {
    window.should.be.an.Object;
  })




})




