'use strict'

var Loo = require('../../models/loo')
var LooList = require('../../models/loo_list')
var config = require('../../config/config')
var _ = require('lodash')
var routes = {}

routes.loos = {
  handler: function * () {
    var loos = yield Loo.find({'properties.active': true}).paginate(this.paginate.options)
    this.status = 200
    this.body = new LooList(loos.results)
    this.paginate = _.omit(loos, 'results')
  },
  path: '/loos',
  method: 'get'
}

routes.nearby_loos = {
    handler: function * () {
      var maxDistance = this.query.radius || config.query_defaults.maxDistance
      var limit = this.query.limit || config.query_defaults.limit
      var loos = yield Loo.findNear(this.params.lon, this.params.lat, maxDistance, limit).exec()
      switch (this.accepts('html', 'json')) {
        case 'html':
          yield this.renderDefaults('list', {
            loo: loos,
            macromap: {
              center: [parseFloat(this.params.lat), parseFloat(this.params.lon)],
              zoom: 17
            }
          })
          break
        case 'json':
          this.status = 200
          this.body = new LooList(loos)
          break
      }
    },
    path: '/loos/near/:lon/:lat',
    method: 'get'
}

routes.loos_in = {
  handler: function * () {
    var loos = yield Loo.findIn(this.params.sw, this.params.ne, this.params.nw, this.params.se).exec()
    this.status = 200
    this.body = new LooList(loos)
  },
  path: '/loos/in/:sw/:ne/:nw/:se',
  method: 'get'
}

routes.loo = {
  handler: function * () {
    var loo = yield Loo.findById(this.params.id).exec()
    if (!loo) {
      return
    }
    switch (this.accepts('html', 'json')) {
      case 'html':
        yield this.renderDefaults('loo', {
            loo: loo.toJSON(),
            macromap: {
                center: loo.geometry.coordinates.slice().reverse(),
                zoom: 17
            }
        })
        break
      case 'json':
        this.status = 200
        this.body = loo
        break
    }
  },
  path: '/loos/:id',
  method: 'get'
}

module.exports = routes