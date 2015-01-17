var gulp = require('gulp');

module.exports = function() {

  gulp.watch(['./app/**/*.js', './lib/**/*.js'], ['jshint']);

  gulp.watch(['./public/src/**/*.js'], ['browserify', 'jshint']);

  gulp.watch('./public/src/**/*.scss', ['sass']);
}