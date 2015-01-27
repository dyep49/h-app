var benv = require('benv');
var config = require('../../../config/config.js');
var dashboard = require('../../public/src/scripts/crossfilter.js');

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



})









// it('has window object', function() {
//   window.should.be.an.Object;
// })

//   it('has nothing to do with index.html', function () {
//     // load into the "browser" window with cache bust
//     benv.require('./app.js');
//     $('body').html().should.include('added');
//   });
