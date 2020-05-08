const pluralize = require('pluralize')
const snakeCase = require('lodash.snakecase')
const QueryBuilder = require('./query-builder')

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
const createModel = (kex, name, options) => {
  const tableName = getTableName(name, options)
  const builder = QueryBuilder.createChildClass(tableName, options)

  return {
    get QueryBuilder () {
      return builder
    },

    get name () {
      return name
    },

    get kex () {
      return kex
    },

    get tableName () {
      return tableName
    },

    get primaryKey () {
      return options.primaryKey || 'id'
    },

    get options () {
      return options
    },

    query () {
      const { knex } = this.kex
      return this.QueryBuilder.create(knex.client)
    }
  }
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
