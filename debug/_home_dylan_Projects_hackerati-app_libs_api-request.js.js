
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_pN4_5Z, __expression_NeuTQW, __block_g30X51;
    var store = require('/home/dylan/Projects/hackerati-app/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_pN4_5Z = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/libs/api-request.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_NeuTQW = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/libs/api-request.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_g30X51 = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/libs/api-request.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_vjkCaa = function(id, obj) {
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
    __extro_Fy0j96 = function(id, obj) {
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
    __statement_pN4_5Z(0);
    var request = (__expression_NeuTQW(1), require('request'));
}
{
    __statement_pN4_5Z(2);
    var Q = (__expression_NeuTQW(3), require('q'));
}
{
    __statement_pN4_5Z(4);
    var apiRequest = {
            getData: function (endpoint) {
                __block_g30X51(0);
                {
                    __statement_pN4_5Z(5);
                    var deferred = __extro_Fy0j96(6, __intro_vjkCaa(6, Q).defer());
                }
                {
                    __statement_pN4_5Z(7);
                    __expression_NeuTQW(8), request(endpoint, function (err, response, body) {
                        __block_g30X51(1);
                        if (__expression_NeuTQW(9), (__expression_NeuTQW(10), !(__expression_NeuTQW(11), err)) && (__expression_NeuTQW(12), response.statusCode === 200)) {
                            __block_g30X51(2);
                            {
                                __statement_pN4_5Z(13);
                                var data = __extro_Fy0j96(14, __intro_vjkCaa(14, JSON).parse(body));
                            }
                            {
                                __statement_pN4_5Z(15);
                                __extro_Fy0j96(16, __intro_vjkCaa(16, deferred).resolve(data));
                            }
                        } else {
                            __block_g30X51(3);
                            {
                                __statement_pN4_5Z(17);
                                var statusCode = (__expression_NeuTQW(20), (__expression_NeuTQW(21), response) && response.statusCode) ? (__expression_NeuTQW(18), response.statusCode) : (__expression_NeuTQW(19), null);
                            }
                            {
                                __statement_pN4_5Z(22);
                                __extro_Fy0j96(23, __intro_vjkCaa(23, deferred).reject({
                                    err: err,
                                    statusCode: statusCode
                                }));
                            }
                        }
                    });
                }
                return __expression_NeuTQW(24), deferred.promise;
            }
        };
}
{
    __statement_pN4_5Z(25);
    module.exports = apiRequest;
}