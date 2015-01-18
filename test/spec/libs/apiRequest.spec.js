var apiRequest = require('../../../libs/api-request.js');
var expect = require('chai').expect;

describe('the bitstamp module', function() {

  it('exports a factory', function() {
    var empty = Object.keys(apiRequest).length === 0 ? true : false;
    expect(empty).to.equal(false);
  });

  // describe('#getData', function() {

  //   it('resolves the promise with data from the Bitstamp API given the correct endpoint', function(done) {
  //     var endpoint = 'https://www.bitstamp.net/api/ticker/';

  //     apiRequest.getData(endpoint).then(function(data) {
  //       expect(data.timestamp).toBeDefined();
  //       expect(data.last).toBeDefined();
  //       done();
  //     })
  //   });

  //   it('rejects the promise when there is an error in the http request', function(done) {
  //     var endpoint = 'thiswillcausesomeproblems.com'

  //     apiRequest.getData(endpoint).fail(function(response) {
  //       expect(response.err).toBeDefined();
  //       done();
  //     })
  //   })

  //   it('rejects the promise when the statusCode is not 200', function(done) {
  //     var endpoint = 'http://www.google.com/404page'

  //     apiRequest.getData(endpoint).fail(function(response) {
  //       expect(response.statusCode).toBe(404);
  //       done();
  //     })

  //   })
  // })
})