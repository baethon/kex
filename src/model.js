const pluralize = require('pluralize')
const snakeCase = require('lodash.snakecase')
const QueryBuilder = require('./query-builder')
const { frozenProperties, toScope } = require('./utils')
const { KexError } = require('./errors')

const getTableName = (modelName, { tableName }) => {
  return tableName || snakeCase(pluralize.plural(modelName))
}

/** @typedef { import('./kex') } Kex */
/** @typedef { import('./kex').ModelOptions } ModelOptions */
/** @typedef { import('./query-builder').QueryBuilder } QueryBuilder */

/**
 * @typedef {Object} Model
 * @property {QueryBuilder} QueryBuilder
 * @property {Function} query create new query
 * @property {Function} addScope add new scope
 * @property {Function} addQueryMacro add new query macro
 * @property {String} name name of the model
 * @property {Kex} kex
 * @property {String} tableName
 * @property {String} primaryKey
 * @property {ModelOptions} options
 */

/**
 * Create the model object
 *
 * @param {Kex} kex
 * @param {String} name
 * @param {ModelOptions} options
 * @return {Model}
 */
const createModel = (kex, name, options = {}) => {
  const tableName = getTableName(name, options)
  const builder = QueryBuilder.createChildClass(tableName, options)
  const Model = {
    query () {
      const { knex } = this.kex
      return this.QueryBuilder.create(knex.client)
    },

    addQueryMacro (name, fn) {
      if (name in this) {
        throw new KexError(`Method [${name}] is already defined in Model`)
      }

      this.QueryBuilder.addMacro(name, fn)
      this[name] = (...args) => {
        const query = this.query()
        return query[name](...args)
      }

      return this
    },

    addScope (name, scopeFn) {
      return this.addQueryMacro(name, toScope(scopeFn))
    },

    setScopes (scopesList) {
      Object.entries(scopesList)
        .forEach(([name, fn]) => this.addScope(name, fn))

      return this
    }
  }

  frozenProperties(Model, {
    QueryBuilder: builder,
    primaryKey: options.primaryKey || 'id',
    name,
    kex,
    tableName,
    options
  })

  const { scopes = {} } = options

  return Model.setScopes(scopes)
}

/**
 * @callback PluginFactory
 * @param {Model} Model
 * @param {Object} options
 */

/**
 * Apply the list of plugins to the Model
 *
 * @param {PluginFactory[]} plugins
 * @param {Model} Model
 * @param {Object} options
 * @return {Model}
 */
const applyPlugins = function (plugins, Model, options) {
  plugins.forEach(fn => {
    fn(Model, options)
  })

  return Model
}

module.exports = { createModel, applyPlugins }
