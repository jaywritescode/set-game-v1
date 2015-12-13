const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('default', ['babel', 'watch']);

gulp.task('babel', () => {
  return gulp.src('public/js/src/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['react']
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/js/build'));
});

gulp.task('watch', () => {
  gulp.watch('public/js/src/*.js', ['babel']);
});
