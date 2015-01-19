
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_pTNBzI, __expression_Xw3uOE, __block_Lu9WzF;
    var store = require('/home/dylan/Projects/hackerati-app/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_pTNBzI = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/libs/api-request.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_Xw3uOE = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/libs/api-request.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_Lu9WzF = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/libs/api-request.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_iZ3USt = function(id, obj) {
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
    __extro_mf5AKV = function(id, obj) {
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
    __statement_pTNBzI(0);
    var request = (__expression_Xw3uOE(1), require('request'));
}
{
    __statement_pTNBzI(2);
    var Q = (__expression_Xw3uOE(3), require('q'));
}
{
    __statement_pTNBzI(4);
    var apiRequest = {
            getData: function (endpoint) {
                __block_Lu9WzF(0);
                {
                    __statement_pTNBzI(5);
                    var deferred = __extro_mf5AKV(6, __intro_iZ3USt(6, Q).defer());
                }
                {
                    __statement_pTNBzI(7);
                    __expression_Xw3uOE(8), request(endpoint, function (err, response, body) {
                        __block_Lu9WzF(1);
                        if (__expression_Xw3uOE(9), (__expression_Xw3uOE(10), !(__expression_Xw3uOE(11), err)) && (__expression_Xw3uOE(12), response.statusCode === 200)) {
                            __block_Lu9WzF(2);
                            {
                                __statement_pTNBzI(13);
                                var data = __extro_mf5AKV(14, __intro_iZ3USt(14, JSON).parse(body));
                            }
                            {
                                __statement_pTNBzI(15);
                                __extro_mf5AKV(16, __intro_iZ3USt(16, deferred).resolve(data));
                            }
                        } else {
                            __block_Lu9WzF(3);
                            {
                                __statement_pTNBzI(17);
                                var statusCode = (__expression_Xw3uOE(20), (__expression_Xw3uOE(21), response) && response.statusCode) ? (__expression_Xw3uOE(18), response.statusCode) : (__expression_Xw3uOE(19), null);
                            }
                            {
                                __statement_pTNBzI(22);
                                __extro_mf5AKV(23, __intro_iZ3USt(23, deferred).reject({
                                    err: err,
                                    statusCode: statusCode
                                }));
                            }
                        }
                    });
                }
                return __expression_Xw3uOE(24), deferred.promise;
            }
        };
}
{
    __statement_pTNBzI(25);
    module.exports = apiRequest;
}