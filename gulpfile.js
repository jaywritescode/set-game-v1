const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('default', () => {
  return gulp.src('public/js/src/solitaire.js')
    .pipe(babel({
      presets: ['react']
    }))
    .pipe(gulp.dest('public/js/build'));
});
