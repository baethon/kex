const Model = require('./model')
const { omit } = require('./utils')
const pluginUtils = require('./plugins')
const { KexError } = require('./errors')

/** @typedef { import('knex/lib/query/builder') } Knex */
/** @typedef { import('knex/lib/client') } KnexClient */
/** @typedef { import('./query-builder').Scope } Scope */
/** @typedef { import('./plugins/soft-deletes').SoftDeleteOptions } SoftDeleteOptions */
/** @typedef { import('./model') } Model */
/** @typedef { import('./model').ModelOptions } ModelOptions */
/** @typedef { import('./model').KnexClientResolver } KnexClientResolver */
/** @typedef { import('./model').TimestampsOptions } TimestampsOptions */

/**
 * @type {Object} ModelDefaultOptions
 * @property {Boolean | SoftDeleteOptions} [softDeletes=false]
 * @property {Object.<String, Object>} [relations]
 * @property {PluginFactory[]} [plugins]
 * @property {Object.<String,Scope>} [scopes]
 * @property {Object.<String,Scope>} [globalScopes]
 * @property {KnexClientResolver} [knexClientResolver]
 * @property {Boolean|TimestampsOptions} [timestamps=false]
 */

/**
 * @typedef {Object} KexOptions
 * @property {ModelDefaultOptions} [modelDefaults]
 * @property {KnexClientResolver} [knexClientResolver]
 */

/**
 * @callback KnexClientResolver
 * @return {KnexClient}
 */

class Kex {
  /**
   * @param {Knex} knex
   * @param {KexOptions} options
   */
  constructor (knex, options) {
    this.models = {}
    this.knex = knex
    this.setOptions(options)
  }

  /**
   * @param {KexOptions}
   * @private
   */
  setOptions (options) {
    const {
      modelDefaults = {},
      ...otherOptions
    } = options

    /** @type {KexOptions} */
    this.options = {
      ...otherOptions,
      modelDefaults: omit(modelDefaults, ['tableName', 'primaryKey', 'relations'])
    }
  }

  /**
   * Create new model
   *
   * @param {String} name
   * @param {ModelOptions} options
   * @return {Model}
   * @throws {KexError}
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

    this.models[name] = pluginUtils.applyPlugins(
      [
        ...pluginUtils.builtinPlugins,
        ...plugins
      ],
      new Model(this, name, useOptions)
    )

    return this.models[name]
  }

  /**
   * @param {String} name
   * @return {Model}
   * @throws {KexError}
   */
  getModel (name) {
    if (name in this.models) {
      return this.models[name]
    }

    throw new KexError(`Model ${name} is not defined`)
  }

  /**
   * @return {KnexClient}
   */
  getKnexClient () {
    const { knexClientResolver } = this.options

    return knexClientResolver
      ? knexClientResolver()
      : this.knex.client
  }
}

module.exports = Kex
