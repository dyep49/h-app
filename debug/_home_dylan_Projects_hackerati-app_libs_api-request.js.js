
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_QVKVSd, __expression_RL86bE, __block_HWG19x;
    var store = require('/home/dylan/Projects/hackerati-app/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_QVKVSd = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/libs/api-request.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_RL86bE = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/libs/api-request.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_HWG19x = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/libs/api-request.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_VKsNn$ = function(id, obj) {
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
    __extro_SEnPss = function(id, obj) {
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
    __statement_QVKVSd(0);
    var request = (__expression_RL86bE(1), require('request'));
}
{
    __statement_QVKVSd(2);
    var Q = (__expression_RL86bE(3), require('q'));
}
{
    __statement_QVKVSd(4);
    var apiRequest = {
            getData: function (endpoint) {
                __block_HWG19x(0);
                {
                    __statement_QVKVSd(5);
                    var deferred = __extro_SEnPss(6, __intro_VKsNn$(6, Q).defer());
                }
                {
                    __statement_QVKVSd(7);
                    __expression_RL86bE(8), request(endpoint, function (err, response, body) {
                        __block_HWG19x(1);
                        if (__expression_RL86bE(9), (__expression_RL86bE(10), !(__expression_RL86bE(11), err)) && (__expression_RL86bE(12), response.statusCode === 200)) {
                            __block_HWG19x(2);
                            {
                                __statement_QVKVSd(13);
                                var data = __extro_SEnPss(14, __intro_VKsNn$(14, JSON).parse(body));
                            }
                            {
                                __statement_QVKVSd(15);
                                __extro_SEnPss(16, __intro_VKsNn$(16, deferred).resolve(data));
                            }
                        } else {
                            __block_HWG19x(3);
                            {
                                __statement_QVKVSd(17);
                                var statusCode = (__expression_RL86bE(20), (__expression_RL86bE(21), response) && response.statusCode) ? (__expression_RL86bE(18), response.statusCode) : (__expression_RL86bE(19), null);
                            }
                            {
                                __statement_QVKVSd(22);
                                __extro_SEnPss(23, __intro_VKsNn$(23, deferred).reject({
                                    err: err,
                                    statusCode: statusCode
                                }));
                            }
                        }
                    });
                }
                return __expression_RL86bE(24), deferred.promise;
            }
        };
}
{
    __statement_QVKVSd(25);
    module.exports = apiRequest;
}