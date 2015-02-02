var config = require('../../../config/config.js');
var queryHelper = require('../../../libs/query-helper.js');

describe('the queryHelper module', function() {

  it('exports an object', function() {
    var empty = Object.keys(queryHelper).length === 0 ? true : false;
    empty.should.equal(false);
  });

  describe('#uniqueByProp', function() {

    it('returns an array of unique objects by a prop given an array of objects', function() {

      var data = [
        {a: 1, b: 2},
        {a: 3, b: 4},
        {a: 1, b: 2},
        {a: 6, b: 3}
      ];

      var unique = [
        {a: 1, b: 2},
        {a: 3, b: 4},
        {a: 6, b: 3}
      ]

      var uniqueData = queryHelper.uniqueByProp(data, 'a');

      JSON.stringify(uniqueData).should.equal(JSON.stringify(unique));
    });
  });


})