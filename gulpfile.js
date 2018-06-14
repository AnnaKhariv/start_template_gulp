'use strict';

var gulp        = require('gulp'), //require - підключення модуля [gulp], яке ми встановили через npm i
    watch       = require('gulp-watch'), //перевірка змін в файлах
    sass        = require('gulp-sass'),
    prefixer    = require('gulp-autoprefixer'), //автоматично добавляє вендорні префікси до CSS властивостей
    uglify      = require('gulp-uglify'),  //minify для JS
    sourcemaps  = require('gulp-sourcemaps'),
    rigger      = require('gulp-rigger'), //плагін дозволяє імпортувати один файл в інший конструкцією //=footer.html
    cssmin      = require('gulp-clean-css'),
    imagemin    = require('gulp-imagemin'),
    pngquant    = require('imagemin-pngquant'), //imagemin для PNG
    rimraf      = require('rimraf'), //uninstall files
    spritesmith = require('gulp.spritesmith'),
    ggcmq        = require('gulp-group-css-media-queries'),
    browserSync = require("browser-sync"),
    reload      = browserSync.reload;

// gulp.task('task_test', function() {
//   //console.log ('Hi!');
//   return gulp.src('source-files');// беремо файл source-files
//   .pipe(plugin()) //виклик команди плагіна, виконуємо якісь дії над вибраним файлом source-files
//   .pipe(gulp.dest('folder')) //вигружаємо файл у папку folder, вказувати тільки шлях!
// });

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/main.js',
        style: 'src/style/main.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};


var config = {
    server: {
        baseDir: "./build"
    },
    notify:false,
    tunnel: true,//
    host: 'localhost',
    port: 9000,
    logPrefix: "gulp_front-end"
};

gulp.task('webserver', function () {
    browserSync(config);
});


gulp.task('html:build', function () {
    gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('style:build', function () {
    gulp.src(path.src.style)
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['src/style/'],
            outputStyle: 'compressed',
            sourceMap: true,
            errLogToConsole: true
        }))
        .pipe(prefixer())
        .pipe(ggcmq())
        .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('sprite', function () {
    var spriteData = gulp.src('src/img/icons/*.png').pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.css',
        algorithm: 'top-down',
        padding: 500
    }));
    return spriteData.pipe(gulp.dest('src/sprites/'));
});


gulp.task('build', [
    'html:build',
    'style:build',
    'fonts:build',
    'image:build',
    'js:build'
]);


gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});


gulp.task('default', ['build', 'webserver', 'watch']);