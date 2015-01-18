var request = require('request');
var Q = require('q');

var apiRequest = {

  getData: function(endpoint) {
    var deferred = Q.defer();

    request(endpoint, function(err, response, body) {
      if(!err && response.statusCode === 200) {
        var data = JSON.parse(body)
        deferred.resolve(data);
      } else {
        var statusCode = response && response.statusCode ? response.statusCode : null
        deferred.reject({err: err, statusCode: statusCode});
      }
    });

    return deferred.promise;
  }
}

module.exports = apiRequest;