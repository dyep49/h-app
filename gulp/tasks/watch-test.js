var gulp = require('gulp');

module.exports = function() {

  gulp.watch(['test/client/front-end/**/*.js', '!test/client/front-end/build/*'], ['browserify-test', 'client-test']);
  
}
