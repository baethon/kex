const modelUtils = require('./model')
const { omit } = require('./utils')
const builtinPlugins = require('./plugins')
const { KexError } = require('./errors')

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
    if (name in this.models) {
      throw new KexError(`Model ${name} is defined`)
    }

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
    const Model = modelUtils.createModel(this, name, useOptions)
    this.models[name] = modelUtils.applyPlugins(modelPlugins, Model, useOptions)

    return this.models[name]
  }

  /**
   * Remove model from the Kex instance
   *
   * This should be used probably only for testing.
   *
   * @param {String} name
   * @return {Kex}
   */
  unloadModel (name) {
    delete this.models[name]
    return this
  }

  /**
   * @param {String} name
   * @return {Object}
   */
  getModel (name) {
    if (name in this.models) {
      return this.models[name]
    }

    throw new KexError(`Model ${name} is not defined`)
  }
}

module.exports = Kex
