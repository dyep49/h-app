
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_r0oahL, __expression_CoYXQY, __block_ee6Ytq;
    var store = require('/home/dylan/Projects/hackerati-app/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_r0oahL = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/libs/bitstamp.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_CoYXQY = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/libs/bitstamp.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_ee6Ytq = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/libs/bitstamp.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_LvBeCF = function(id, obj) {
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
    __extro_Pbe$nU = function(id, obj) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/libs/bitstamp.js');
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
    __statement_r0oahL(0);
    var request = (__expression_CoYXQY(1), require('request'));
}
{
    __statement_r0oahL(2);
    var Q = (__expression_CoYXQY(3), require('q'));
}
{
    __statement_r0oahL(4);
    var bitstamp = {
            getData: function (endpoint) {
                __block_ee6Ytq(0);
                {
                    __statement_r0oahL(5);
                    var deferred = __extro_Pbe$nU(6, __intro_LvBeCF(6, Q).defer());
                }
                {
                    __statement_r0oahL(7);
                    __expression_CoYXQY(8), request(endpoint, function (err, response, body) {
                        __block_ee6Ytq(1);
                        if (__expression_CoYXQY(9), (__expression_CoYXQY(10), !(__expression_CoYXQY(11), err)) && (__expression_CoYXQY(12), response.statusCode === 200)) {
                            __block_ee6Ytq(2);
                            {
                                __statement_r0oahL(13);
                                var data = __extro_Pbe$nU(14, __intro_LvBeCF(14, JSON).parse(body));
                            }
                            {
                                __statement_r0oahL(15);
                                __extro_Pbe$nU(16, __intro_LvBeCF(16, deferred).resolve(data));
                            }
                        } else {
                            __block_ee6Ytq(3);
                            {
                                __statement_r0oahL(17);
                                __extro_Pbe$nU(18, __intro_LvBeCF(18, deferred).reject(err, response.statusCode));
                            }
                        }
                    });
                }
                return __expression_CoYXQY(19), deferred.promise;
            }
        };
}
{
    __statement_r0oahL(20);
    module.exports = bitstamp;
}