var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var reload = require('browser-sync').reload;

module.exports = function() {
  gulp.task('nodemon', function() {
    nodemon({
      script: 'app.js',
      ext: 'js ejs',
      ignore: ['public/**/*.js', 'gulp/**/*.js', 'node_modules/**/*']
      // nodeArgs: ['debug']
    })
      .on('restart', function() {
        setTimeout(function() {
          reload();
        }, 500)
      })
  })
}