const modelUtils = require('./model')
const { omit } = require('./utils')
const builtinPlugins = require('./plugins')

class Kex {
  constructor (knex, options) {
    this.models = {}
    this.knex = knex
    this.setOptions(options)
  }

  /**
   * @param {Object}
   */
  setOptions (options) {
    const {
      modelDefaults = {},
      ...otherOptions
    } = options

    this.options = {
      ...otherOptions,
      modelDefaults: omit(modelDefaults, ['tableName', 'primaryKey'])
    }
  }

  /**
   * Create new model
   *
   * @param {String} name
   * @param {Object} options
   * @return {Object}
   */
  createModel (name, options = {}) {
    const {
      plugins = [],
      modelDefaults
    } = this.options

    const useOptions = {
      ...modelDefaults,
      ...options
    }

    const modelPlugins = [
      ...builtinPlugins,
      ...plugins
    ]
    const Model = modelUtils.createModel(this.knex, name, useOptions)
    this.models[name] = modelUtils.applyPlugins(modelPlugins, Model, useOptions)

    return this.models[name]
  }
}

module.exports = Kex
