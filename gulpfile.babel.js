'use strict';

/*

Just remove

babel-loader/src/index.js

Lines 119 to 122 in 43543b7
     exists(fileSystem, loaderOptions.babelrc) 
       ? loaderOptions.babelrc 
       : resolveRc(fileSystem, path.dirname(filename)); 
 } 

*/

import config from './config';

import gulp from 'gulp';
import gutil from 'gulp-util';

import cleanCSS from 'gulp-clean-css';
import htmlmin from 'gulp-htmlmin';
import imagemin from 'gulp-imagemin';
import del from 'del';

import babel from 'gulp-babel';
import Cache from 'gulp-file-cache';
import nodemon from 'gulp-nodemon';

import webpack from 'gulp-webpack';
import webpackConfig from './webpack.config.js';

import browserSync from 'browser-sync';

let cache = new Cache();

const DIR = {
    SRC: 'src/'+config.dir,
    DEST: 'dist/'+config.dir
};

const SRC = {
    OUTJS: DIR.SRC + '/js/*.js',
    OUTCSS: DIR.SRC + '/css/**',
    JS: DIR.SRC + '/js/'+config.name+'/**',
    CSS: DIR.SRC + '/js/'+config.name+'/css/**',
    XHR: DIR.SRC + '/js/'+config.name+'/xhr/**',
    FONT: DIR.SRC + '/font/**',
    HTML: DIR.SRC + '/html/'+config.name+'.*',
    IMAGES: DIR.SRC + '/js/'+config.name+'/images/**',
    SERVER: 'server/*'
};

const DEST = {
    OUTJS: DIR.DEST + '/js',
    OUTCSS: DIR.DEST + '/css',
    JS: DIR.DEST + '/js/'+config.name,
    CSS: DIR.DEST + '/js/'+config.name+'/css',
    XHR: DIR.DEST + '/js/'+config.name+'/xhr',
    FONT: DIR.DEST + '/font',
    HTML: DIR.DEST + '/html',
    IMAGES: DIR.DEST + '/js/'+config.name+'/images',
    SERVER: 'app'
};

gulp.task(config.name, () => {
  gutil.log(gutil.colors.green('#Build a ') ,gutil.colors.blue('[ '+config.name+' ]'));

});

gulp.task('out', () => {
  gulp.src(SRC.OUTJS)
    .pipe(gulp.dest(DEST.OUTJS));

  gulp.src(SRC.OUTCSS)
    .pipe(gulp.dest(DEST.OUTCSS));

});

gulp.task('clean', () => {
  del.sync([DIR.DEST]);
});

gulp.task('webpack', () => {
  gulp.src('src/'+config.dir+'/js/'+config.name+'/main.js')
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest('dist/'+config.dir+'/js/'+config.name));
});

gulp.task('css', () => {
  gulp.src(SRC.CSS)
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest(DEST.CSS));
});

gulp.task('xhr', () => {
 gulp.src(SRC.XHR)
    .pipe(gulp.dest(DEST.XHR));
});

gulp.task('font', () => {
 gulp.src(SRC.FONT)
    .pipe(gulp.dest(DEST.FONT));
});

gulp.task('html', () => {
  gulp.src(SRC.HTML)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(DEST.HTML))
});

gulp.task('images', () => {
  gulp.src(SRC.IMAGES)
    .pipe(imagemin())
    .pipe(gulp.dest(DEST.IMAGES));
});

gulp.task('babel', () => {
  gulp.src(SRC.SERVER)
    .pipe(cache.filter())
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(cache.cache())
    .pipe(gulp.dest(DEST.SERVER));
});

gulp.task('watch', () => {
    let watcher = {
        webpack: gulp.watch(SRC.JS, ['webpack']),
        css: gulp.watch(SRC.CSS, ['css']),
        xhr: gulp.watch(SRC.XHR, ['xhr']),
        font: gulp.watch(SRC.FONT, ['font']),
        html: gulp.watch(SRC.HTML, ['html']),
        images: gulp.watch(SRC.IMAGES, ['images']),
        babel: gulp.watch(SRC.SERVER, ['babel'])
    };

    let notify = (event) => {
        gutil.log('File', gutil.colors.yellow(event.path), 'was', gutil.colors.magenta(event.type));
    };

    for(let key in watcher) {
        watcher[key].on('change', notify);
    }
});

gulp.task('start', ['babel'], () => {
  nodemon({
    script: DEST.SERVER + '/main.js',
    watch: DEST.SERVER
  });
});

gulp.task('browser-sync', () => {
  browserSync.init(null, {
    proxy: "http://localhost:3000/"+config.dir+"/html/"+config.name+".html",
    files: "dist/"+config.dir+"/**", // 전체 자동 새로고침
    // files: "dist/"+config.dir+"/js/"+config.name+"/css/*.css", // 스타일만 겨체
    port: 7000
  })
});

gulp.task(config.dir,
	['clean', 'out', 'webpack', 'css', 'xhr', 'font', 'html', 'images', 'watch', 'start', 'browser-sync'],
	() => {
		gutil.log(gutil.colors.green('#Running Build your repository') ,gutil.colors.blue('[ '+config.dir+' ]')); 
	}
);
