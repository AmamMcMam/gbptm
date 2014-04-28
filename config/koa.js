'use strict';

var fs = require('fs'),
    path = require('path'),
    logger = require('koa-logger'),
    router = require('koa-router'),
    favicon = require('koa-favicon'),
    serializer = require('../api/koa-serializer'),
    config = require('./config');

module.exports = function(app){
    if (config.app.env !== 'test') {
        app.use(logger());
    }

    app.use(favicon()); // Bounce annoying favicon requests with a 404
    app.use(serializer());
    app.use(router(app)); 

    // mount all the routes defined in the api/controllers
    fs.readdirSync(path.join(config.app.root, 'api', 'controllers')).forEach(function(file){
        require(path.join(config.app.root, 'api', 'controllers', file)).init(app);
    });
};