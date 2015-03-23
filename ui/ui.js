'use strict'

var khbs = require('koa-hbs')
var koa_static = require('koa-static')
var helpers = require('./helpers')(khbs.handlebars)
var _ = require('lodash')

function hbs_defaults (config) {
  return function * (next) {
    this.renderDefaults = function * (tpl, data) {
      _.merge(data, {
        config: config,
        prefs: JSON.parse(this.cookies.get('prefs') || '{}'),
        flash: this.flash,
        backlink: this.req.headers.referer || config.app.baseURL
      })
      yield this.render.apply(this, [tpl, data])
    }
    yield next
  }
}

module.exports.init = function (app, config) {
  _.each(helpers, function (helper, name) {
    khbs.registerHelper(name, helper)
  })
  app.use(khbs.middleware({
    viewPath: __dirname + '/views/pages',
    partialsPath: __dirname + '/views/partials',
    layoutsPath: __dirname + '/views/layouts',
    defaultLayout: 'base',
    extname: '.hbs'
  }))
  app.use(hbs_defaults(config))
  app.use(koa_static(__dirname + '/public', {
    maxage: config.app.cache.maxage
  }))
}