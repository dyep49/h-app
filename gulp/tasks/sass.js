var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var minifyCSS = require('gulp-minify-css');
var reload = require('browser-sync').reload;


module.exports = function() {
  gulp.task('sass', function () {
    gulp.src('./public/src/**/*.scss')
      .pipe(plumber())
      .pipe(sass({
        errLogToConsole: true,
        style: 'compressed',
      }))
      .pipe(minifyCSS())
      .pipe(gulp.dest('./public/build/'))
      .pipe(reload({stream: true}));
  });
}