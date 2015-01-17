var request = require('request');
var Q = require('q');

var bitstamp = {

  getPrice: function() {
    var deferred = Q.defer();
    var bitstampEndpoint = 'https://www.bitstamp.net/api/ticker/';

    request(bitstampEndpoint, function(err, response, body) {
      if(!err && response.statusCode === 200) {
        var data = JSON.parse(body)
        deferred.resolve(data);
      } else {
        deferred.reject(err);
      }
    });

    return deferred.promise;
  }
}

module.exports = bitstamp;