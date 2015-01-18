
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_zGykC0, __expression_n3NT0v, __block_$jbdvb;
    var store = require('/home/dylan/Projects/hackerati-app/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_zGykC0 = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/libs/api-request.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_n3NT0v = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/libs/api-request.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_$jbdvb = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/libs/api-request.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_gnX9k7 = function(id, obj) {
        // console.log('__intro: ', id, ', obj.__instrumented_miss: ', obj.__instrumented_miss, ', obj.length: ', obj.length);
        (typeof obj === 'object' || typeof obj === 'function') &&
            Object.defineProperty && Object.defineProperty(obj, '__instrumented_miss', {enumerable: false, writable: true});
        obj.__instrumented_miss = obj.__instrumented_miss || [];
        if ('undefined' !== typeof obj && null !== obj && 'undefined' !== typeof obj.__instrumented_miss) {
            if (obj.length === 0) {
                // console.log('interim miss: ', id);
                obj.__instrumented_miss[id] = true;
            } else {
                obj.__instrumented_miss[id] = false;
            }
        }
        return obj;
    };
    function isProbablyChainable(obj, id) {
        return obj &&
            obj.__instrumented_miss[id] !== undefined &&
            'number' === typeof obj.length;
    }
    __extro_y5tdTf = function(id, obj) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/libs/api-request.js');
        // console.log('__extro: ', id, ', obj.__instrumented_miss: ', obj.__instrumented_miss, ', obj.length: ', obj.length);
        if ('undefined' !== typeof obj && null !== obj && 'undefined' !== typeof obj.__instrumented_miss) {
            if (isProbablyChainable(obj, id) && obj.length === 0 && obj.__instrumented_miss[id]) {
                // if the call was not a "constructor" - i.e. it did not add things to the chainable
                // and it did not return anything from the chainable, it is a miss
                // console.log('miss: ', id);
            } else {
                fs.writeSync(fd, '{"chain": {"node": ' + id + '}},\n');
            }
            obj.__instrumented_miss[id] = undefined;
        } else {
            fs.writeSync(fd, '{"chain": {"node": ' + id + '}},\n');
        }
        return obj;
    };
};
////////////////////////

// Instrumented Code
{
    __statement_zGykC0(0);
    var request = (__expression_n3NT0v(1), require('request'));
}
{
    __statement_zGykC0(2);
    var Q = (__expression_n3NT0v(3), require('q'));
}
{
    __statement_zGykC0(4);
    var apiRequest = {
            getData: function (endpoint) {
                __block_$jbdvb(0);
                {
                    __statement_zGykC0(5);
                    var deferred = __extro_y5tdTf(6, __intro_gnX9k7(6, Q).defer());
                }
                {
                    __statement_zGykC0(7);
                    __expression_n3NT0v(8), request(endpoint, function (err, response, body) {
                        __block_$jbdvb(1);
                        if (__expression_n3NT0v(9), (__expression_n3NT0v(10), !(__expression_n3NT0v(11), err)) && (__expression_n3NT0v(12), response.statusCode === 200)) {
                            __block_$jbdvb(2);
                            {
                                __statement_zGykC0(13);
                                var data = __extro_y5tdTf(14, __intro_gnX9k7(14, JSON).parse(body));
                            }
                            {
                                __statement_zGykC0(15);
                                __extro_y5tdTf(16, __intro_gnX9k7(16, deferred).resolve(data));
                            }
                        } else {
                            __block_$jbdvb(3);
                            {
                                __statement_zGykC0(17);
                                var statusCode = (__expression_n3NT0v(20), (__expression_n3NT0v(21), response) && response.statusCode) ? (__expression_n3NT0v(18), response.statusCode) : (__expression_n3NT0v(19), null);
                            }
                            {
                                __statement_zGykC0(22);
                                __extro_y5tdTf(23, __intro_gnX9k7(23, deferred).reject({
                                    err: err,
                                    statusCode: statusCode
                                }));
                            }
                        }
                    });
                }
                return __expression_n3NT0v(24), deferred.promise;
            }
        };
}
{
    __statement_zGykC0(25);
    module.exports = apiRequest;
}