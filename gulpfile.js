var gulp    = require('gulp');
var gutil   = require('gulp-util');
var coffee  = require('gulp-coffee');
var uglify  = require('gulp-uglify');
var rename  = require("gulp-rename");

gulp.task('build', function(){
  gulp.src('*.coffee').pipe(
    coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('build/'))
    .pipe(rename(function (dir, base, ext) {
      return base + "-min" + ext;
    }))
    .pipe(uglify())
    .pipe(gulp.dest('build/'))
});
