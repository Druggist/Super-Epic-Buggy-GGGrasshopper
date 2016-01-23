//////////////////////////////////////////
// Required
//////////////////////////////////////////
var gulp = require("gulp"),
    uglify = require("gulp-uglify"),
    rename = require("gulp-rename"),
    sass = require("gulp-sass"),
    watch = require("gulp-watch"),
    plumber = require("gulp-plumber"),
    autoprefixer = require("gulp-autoprefixer"),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    imageop = require('gulp-image-optimization'),
    minifycss = require("gulp-minify-css");

//////////////////////////////////////////
// Scripts Tasks
//////////////////////////////////////////
gulp.task("scripts", function () {
    gulp.src("static/js/**/!(*.min.js)")
        .pipe(plumber())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(uglify())
        .pipe(gulp.dest(function(file) {
            return file.base;
        }))
        .pipe(reload({
            stream: true
        }));
});

//////////////////////////////////////////
// Styles Task
//////////////////////////////////////////
gulp.task("sass", function () {
    gulp.src("static/sass/*.sass")
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer("last 2 versions"))
        .pipe(rename(function (path) {
            path.dirname += "/static/css";
            }
        ))
        
        .pipe(rename({suffix: ".min" }))
        .pipe(minifycss())
        .pipe(gulp.dest("./"))
        .pipe(reload({
            stream: true
        }));
});

//////////////////////////////////////////
// Images Task
//////////////////////////////////////////
gulp.task('images', function () {
    gulp.src(['static/img/**/*.png', 'static/img/**/*.jpg', 'static/img/**/*.gif', 'static/img/**/*.jpeg'])
        .pipe(imageop({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(function(file) {
            return file.base;
        }));
});

//////////////////////////////////////////
// Html Task
//////////////////////////////////////////
gulp.task("html", function () {
    gulp.src("index.html")
        .pipe(reload({
            stream: true
        }));
});

//////////////////////////////////////////
// BrowserSync Tasks
//////////////////////////////////////////
gulp.task('browser-sync', function() {
    browserSync.init({
        server: "./",
        online: true
    });
});

//////////////////////////////////////////
//Watch Task
//////////////////////////////////////////
gulp.task("watch", function () {
    gulp.watch("static/js/**/!(*.min.js)", ["scripts"]);
    gulp.watch("static/sass/*.sass", ["sass"]);
    gulp.watch("index.html", ["html"]);
});

//////////////////////////////////////////
//Compile Task
//////////////////////////////////////////
gulp.task("compile", ["scripts", "sass", "images"]);

//////////////////////////////////////////
//Default Task
//////////////////////////////////////////
gulp.task("default", ["scripts", "sass", "html", "browser-sync", "watch"]);