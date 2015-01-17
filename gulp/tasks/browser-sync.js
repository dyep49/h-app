var gulp = require('gulp');
var browserSync = require('browser-sync');

module.exports = function() {
  gulp.task('browser-sync', ['nodemon'], function() {
    browserSync({
      proxy: 'localhost:4000',
      port: 3000,
      notify: false,
      open: false
    })
  })
}