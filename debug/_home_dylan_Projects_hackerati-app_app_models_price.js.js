
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_fEYaKu, __expression_yls7H5, __block_GAZEz$;
    var store = require('/home/dylan/Projects/hackerati-app/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_fEYaKu = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/app/models/price.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_yls7H5 = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/app/models/price.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_GAZEz$ = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/app/models/price.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_IYMFWl = function(id, obj) {
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
    __extro_B8q4jC = function(id, obj) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/app/models/price.js');
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
    __statement_fEYaKu(0);
    'use strict';
}
{
    __statement_fEYaKu(1);
    var mongoose = (__expression_yls7H5(2), require('mongoose'));
}
{
    __statement_fEYaKu(3);
    var Schema = mongoose.Schema;
}
{
    __statement_fEYaKu(4);
    var Q = (__expression_yls7H5(5), require('q'));
}
{
    __statement_fEYaKu(6);
    var PriceSchema = new Schema({
            time: Date,
            lastPrice: Number
        });
}
{
    __statement_fEYaKu(7);
    PriceSchema.methods.create = function (attrs) {
        __block_GAZEz$(0);
        {
            __statement_fEYaKu(8);
            var deferred = __extro_B8q4jC(9, __intro_IYMFWl(9, Q).defer());
        }
        {
            __statement_fEYaKu(10);
            this.lastPrice = attrs.price;
        }
        {
            __statement_fEYaKu(11);
            this.time = attrs.time;
        }
        {
            __statement_fEYaKu(12);
            __extro_B8q4jC(13, __intro_IYMFWl(13, this).save(function (err, price) {
                __block_GAZEz$(1);
                {
                    __statement_fEYaKu(14);
                    (__expression_yls7H5(17), err) ? (__expression_yls7H5(15), __extro_B8q4jC(18, __intro_IYMFWl(18, deferred).reject(err))) : (__expression_yls7H5(16), __extro_B8q4jC(19, __intro_IYMFWl(19, deferred).resolve(price)));
                }
            }));
        }
        return __expression_yls7H5(20), deferred.promise;
    };
}
{
    __statement_fEYaKu(21);
    module.exports = __extro_B8q4jC(22, __intro_IYMFWl(22, mongoose).model('Price', PriceSchema));
}