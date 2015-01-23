var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

module.exports = function() {
  gulp.task('jshint', function() {
    return gulp.src(['./public/**/*.js', './app/**/*.js', 'lib/**/*.js', '!./public/build/**/*.js', '!./public/build/**/vendor/*.js'])
      .pipe(jshint())
      .pipe(jshint.reporter(stylish))
  });
}