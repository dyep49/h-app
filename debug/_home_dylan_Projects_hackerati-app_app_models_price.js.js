
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_Nw_Bf0, __expression_Nyq3qN, __block_jTLUGy;
    var store = require('/home/dylan/Projects/hackerati-app/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_Nw_Bf0 = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/app/models/price.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_Nyq3qN = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/app/models/price.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_jTLUGy = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/app/models/price.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_SIdJlV = function(id, obj) {
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
    __extro_kPIK$3 = function(id, obj) {
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
    __statement_Nw_Bf0(0);
    'use strict';
}
{
    __statement_Nw_Bf0(1);
    var mongoose = (__expression_Nyq3qN(2), require('mongoose'));
}
{
    __statement_Nw_Bf0(3);
    var Schema = mongoose.Schema;
}
{
    __statement_Nw_Bf0(4);
    var Q = (__expression_Nyq3qN(5), require('q'));
}
{
    __statement_Nw_Bf0(6);
    var PriceSchema = new Schema({
            time: Date,
            lastPrice: Number
        });
}
{
    __statement_Nw_Bf0(7);
    PriceSchema.methods.create = function (attrs) {
        __block_jTLUGy(0);
        {
            __statement_Nw_Bf0(8);
            var deferred = __extro_kPIK$3(9, __intro_SIdJlV(9, Q).defer());
        }
        {
            __statement_Nw_Bf0(10);
            this.lastPrice = attrs.price;
        }
        {
            __statement_Nw_Bf0(11);
            this.time = attrs.time;
        }
        {
            __statement_Nw_Bf0(12);
            __extro_kPIK$3(13, __intro_SIdJlV(13, this).save(function (err, price) {
                __block_jTLUGy(1);
                {
                    __statement_Nw_Bf0(14);
                    (__expression_Nyq3qN(17), err) ? (__expression_Nyq3qN(15), __extro_kPIK$3(18, __intro_SIdJlV(18, deferred).reject(err))) : (__expression_Nyq3qN(16), __extro_kPIK$3(19, __intro_SIdJlV(19, deferred).resolve(price)));
                }
            }));
        }
        return __expression_Nyq3qN(20), deferred.promise;
    };
}
{
    __statement_Nw_Bf0(21);
    module.exports = __extro_kPIK$3(22, __intro_SIdJlV(22, mongoose).model('Price', PriceSchema));
}