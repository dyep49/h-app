
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_a_y8yj, __expression_f8uQdV, __block_x_09oM;
    var store = require('/home/dylan/Projects/hackerati-app/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_a_y8yj = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/libs/collect-data.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_f8uQdV = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/libs/collect-data.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_x_09oM = function(i) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/libs/collect-data.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_vQg_LX = function(id, obj) {
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
    __extro_cIwcEf = function(id, obj) {
        var fd = store.register('/home/dylan/Projects/hackerati-app/libs/collect-data.js');
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
    __statement_a_y8yj(0);
    var mongoose = (__expression_f8uQdV(1), require('mongoose'));
}
{
    __statement_a_y8yj(2);
    var Price = __extro_cIwcEf(3, __intro_vQg_LX(3, mongoose).model('Price'));
}
{
    __statement_a_y8yj(4);
    var apiRequest = (__expression_f8uQdV(5), require('./api-request.js'));
}
{
    __statement_a_y8yj(6);
    var Q = (__expression_f8uQdV(7), require('q'));
}
function savePrice() {
    __block_x_09oM(0);
    {
        __statement_a_y8yj(8);
        var bitstampEndpoint = 'https://www.bitstamp.net/api/ticker/';
    }
    {
        __statement_a_y8yj(9);
        __extro_cIwcEf(10, __intro_vQg_LX(10, __extro_cIwcEf(11, __intro_vQg_LX(11, __extro_cIwcEf(12, __intro_vQg_LX(12, __extro_cIwcEf(13, __intro_vQg_LX(13, __extro_cIwcEf(14, __intro_vQg_LX(14, apiRequest).getData(bitstampEndpoint))).then(function (data) {
            __block_x_09oM(1);
            {
                __statement_a_y8yj(15);
                var time = new Date((__expression_f8uQdV(16), parseInt((__expression_f8uQdV(17), data.timestamp * 1000))));
            }
            {
                __statement_a_y8yj(18);
                var price = (__expression_f8uQdV(19), parseFloat(data.last));
            }
            {
                __statement_a_y8yj(20);
                var newPrice = new Price();
            }
            return __expression_f8uQdV(21), __extro_cIwcEf(22, __intro_vQg_LX(22, newPrice).create({
                time: time,
                price: price
            }));
        }))).catch(function () {
            __block_x_09oM(2);
            {
                __statement_a_y8yj(23);
                throw new Error((__expression_f8uQdV(24), 'Unable to retrieve data from Bitstamp ' + (__expression_f8uQdV(25), err)));
            }
        }))).then(function (price) {
            __block_x_09oM(3);
            {
                __statement_a_y8yj(26);
                __extro_cIwcEf(27, __intro_vQg_LX(27, console).log(price));
            }
        }))).catch(function () {
            __block_x_09oM(4);
            {
                __statement_a_y8yj(28);
                throw new Error((__expression_f8uQdV(29), 'Unable to save to database ' + (__expression_f8uQdV(30), err)));
            }
        }));
    }
}
{
    __statement_a_y8yj(31);
    module.exports = savePrice;
}