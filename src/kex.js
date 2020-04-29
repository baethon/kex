const { createModel, applyPlugins } = require('./model')

class Kex {
  constructor (knex, options) {
    this.models = {}
    this.knex = knex
    this.options = options
  }

  createModel (name, options = {}) {
    const { plugins = [] } = this.options

    const Model = createModel(this.knex, name, options)
    this.models[name] = applyPlugins(plugins, Model, options)

    return this.models[name]
  }
}

module.exports = Kex
