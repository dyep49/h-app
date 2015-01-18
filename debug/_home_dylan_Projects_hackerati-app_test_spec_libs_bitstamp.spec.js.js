
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_eljJtQ, __expression_C$xVUL, __block_cxFRII;
    var store = require('/home/dylan/Projects/hackerati-app/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_eljJtQ = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/test/spec/libs/bitstamp.spec.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_C$xVUL = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/test/spec/libs/bitstamp.spec.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_cxFRII = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/test/spec/libs/bitstamp.spec.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_FoLE1n = function(id, obj) {
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
    __extro_XeJtPT = function(id, obj) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/test/spec/libs/bitstamp.spec.js');
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
    __statement_eljJtQ(0);
    var bitstamp = (__expression_C$xVUL(1), require('../../../libs/bitstamp.js'));
}
{
    __statement_eljJtQ(2);
    __expression_C$xVUL(3), describe('the bitstamp module', function () {
        __block_cxFRII(0);
        {
            __statement_eljJtQ(4);
            __expression_C$xVUL(5), it('exports a factory', function () {
                __block_cxFRII(1);
                {
                    __statement_eljJtQ(6);
                    var empty = (__expression_C$xVUL(9), __extro_XeJtPT(10, __intro_FoLE1n(10, Object).keys(bitstamp)).length === 0) ? (__expression_C$xVUL(7), true) : (__expression_C$xVUL(8), false);
                }
                {
                    __statement_eljJtQ(11);
                    __extro_XeJtPT(12, __intro_FoLE1n(12, (__expression_C$xVUL(13), expect(empty))).toBe(false));
                }
            });
        }
    });
}