var apiRequest = require('../../../libs/api-request.js');

describe('the apiRequest module', function() {

  it('exports a factory', function() {
    var empty = Object.keys(apiRequest).length === 0 ? true : false;
    empty.should.equal(false);
  });

  describe('#getData', function() {

    it('resolves the promise when there is a successful response', function() {
      var endpoint = 'https://www.bitstamp.net/api/ticker/';

      return apiRequest.getData(endpoint).should.be.fulfilled;
    })

    it('returns JSON on a successful response', function(done) {
      var endpoint = 'https://www.bitstamp.net/api/ticker/';

      apiRequest.getData(endpoint).then(function(data) {
        data.timestamp.should.exist;
        data.last.should.exist;
        done();
      })
    });

    it('rejects the promise when there is an error in the http request', function() {
      var endpoint = 'thiswillcauseproblems.com'

      return apiRequest.getData(endpoint).should.be.rejected;
    });

    it('rejects the promise where the response does not yield a status code of 200', function() {

      var endpoint = 'http://www.google.com/404page'

      return apiRequest.getData(endpoint).should.be.rejected;
    });

  
  });
})