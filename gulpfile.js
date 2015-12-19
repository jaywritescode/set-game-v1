const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('default', ['babel', 'watch']);

gulp.task('babel', () => {
  return gulp.src('public/js/src/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      "presets": ["es2015", "react"],
      "plugins": ["transform-es2015-modules-amd"]
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/js/build'));
});

gulp.task('watch', () => {
  gulp.watch('public/js/src/*.js', ['babel']);
});
