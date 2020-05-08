const modelUtils = require('./model')
const { omit } = require('./utils')
const builtinPlugins = require('./plugins')
const { KexError } = require('./errors')

/** @typedef { import('knex/lib/query/builder') } Knex */
/** @typedef { import('./query-builder').Scope } Scope */
/** @typedef { import('./plugins/soft-deletes').SoftDeleteOptions } SoftDeleteOptions */
/** @typedef { import('./model').Model } Model */
/** @typedef { import('./relations/relation') } Relation */

/**
 * @type {Object} ModelDefaultOptions
 * @property {Boolean | SoftDeleteOptions} [softDeletes=false]
 * @property {Object.<String, Object>} [relations]
 * @property {PluginFactory[]} [plugins]
 * @property {Object.<String,Scope>} [scopes]
 * @property {Object.<String,Scope>} [globalScopes]
 */

/**
 * @typedef {Object} ModelOptions
 * @property {String} [tableName]
 * @property {String} [primaryKey=id]
 * @property {Boolean | SoftDeleteOptions} [softDeletes=false]
 * @property {Object.<String, Object>} [relations]
 * @property {PluginFactory[]} [plugins]
 * @property {Object.<String,Scope>} [scopes]
 * @property {Object.<String,Scope>} [globalScopes]
 * @property {Object.<String,Relation>} [relations]
 */

/**
 * @typedef {Object} KexOptions
 * @property {ModelDefaultOptions} [modelDefaults]
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
   * @param {Object}
   * @private
   */
  setOptions (options) {
    const {
      modelDefaults = {},
      ...otherOptions
    } = options

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

    const modelPlugins = [
      ...builtinPlugins,
      ...plugins
    ]
    const Model = modelUtils.createModel(this, name, useOptions)
    this.models[name] = modelUtils.applyPlugins(modelPlugins, Model, useOptions)

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
}

module.exports = Kex
