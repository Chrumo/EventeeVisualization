const elixir = require('laravel-elixir');
require('laravel-elixir-html-minify');
require('laravel-elixir-remove');

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Sass
 | file for your application as well as publishing vendor resources.
 |
 */

elixir(function (mix) {
    const NODE = 'node_modules/';
    const APP = 'app/';
    const JS_SOURCE = APP + 'js/';
    const CSS_SOURCE = APP + 'css/';
    const BUILD = 'build/';
    const CSS_DESTINATION = BUILD + 'css/';
    const FONT_DESTINATION = BUILD + 'fonts/';
    const JS_DESTINATION = BUILD + 'js/';

    ///////////////////////////////////////////////////// CLEAN UP ///////////////////////////////////////////////////
    mix.remove([
        BUILD
    ]);

    ///////////////////////////////////////////////////// STYLES /////////////////////////////////////////////////////
    mix.styles([
        'bootstrap/dist/css/bootstrap.css',
        'slick-carousel/slick/slick.css',
        'slick-carousel/slick/slick-theme.css',
        'angular-ui-bootstrap/dist/ui-bootstrap-csp.css'
    ], CSS_DESTINATION + 'styles.css', NODE);

    mix.stylesIn(CSS_SOURCE, CSS_DESTINATION + 'app.css');

    ///////////////////////////////////////////////////// SCRIPTS ////////////////////////////////////////////////////
    mix.scripts([
        'jquery/dist/jquery.js',
        'bootstrap/dist/js/bootstrap.js',
        'underscore/underscore.js',
        'moment/moment.js',
        'slick-carousel/slick/slick.js',
        'd3/d3.js'
    ], JS_DESTINATION + 'scripts.js', NODE);

    mix.scripts([
        'angular/angular.js',
        'angular-ui-router/release/angular-ui-router.js',
        'restangular/dist/restangular.js',
        'angular-slick-carousel/dist/angular-slick.js',
        'angular-ui-bootstrap/dist/ui-bootstrap.js',
        'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js'
    ], JS_DESTINATION + 'angular-scripts.js', NODE);

    mix.scripts([
        'app.js'
    ], JS_DESTINATION + 'app.js', JS_SOURCE);

    mix.scriptsIn(JS_SOURCE + 'config/', JS_DESTINATION + 'config.js');
    mix.scriptsIn(JS_SOURCE + 'controllers/', JS_DESTINATION + 'controllers.js');
    mix.scriptsIn(JS_SOURCE + 'directives/', JS_DESTINATION + 'directives.js');
    mix.scriptsIn(JS_SOURCE + 'factories/', JS_DESTINATION + 'factories.js');
    mix.scriptsIn(JS_SOURCE + 'services/', JS_DESTINATION + 'services.js');
    mix.scriptsIn(JS_SOURCE + 'values/', JS_DESTINATION + 'values.js');

    ///////////////////////////////////////////////////// FONTS //////////////////////////////////////////////////////
    mix.copy(NODE + 'bootstrap/dist/fonts', FONT_DESTINATION);
    mix.copy(NODE + 'slick-carousel/slick/fonts', CSS_DESTINATION + 'fonts/');

    ///////////////////////////////////////////////////// IMAGES /////////////////////////////////////////////////////
    mix.copy(NODE + 'slick-carousel/slick/ajax-loader.gif', CSS_DESTINATION);

    ///////////////////////////////////////////////////// HTML ///////////////////////////////////////////////////////
    mix.html('index.html', BUILD, APP);
    mix.html('views/', BUILD + 'views/', APP);
});
