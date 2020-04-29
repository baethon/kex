const modelUtils = require('./model')
const { omit } = require('./utils')

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

    const Model = modelUtils.createModel(this.knex, name, useOptions)
    this.models[name] = modelUtils.applyPlugins(plugins, Model, useOptions)

    return this.models[name]
  }
}

module.exports = Kex
