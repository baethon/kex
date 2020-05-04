const pluralize = require('pluralize')
const snakeCase = require('lodash.snakecase')
const QueryBuilder = require('./query-builder')

const getTableName = (modelName, { tableName }) => {
  return tableName || snakeCase(pluralize.plural(modelName))
}

/** @typedef { import('./kex') } Kex */

/**
 * @typedef {Object} Model
 * @property {QueryBuilder} QueryBuilder
 * @property {Function} query create new query
 * @property {String} name name of the model
 * @property {Kex} kex
 * @property {String} tableName
 */

/**
 * Create the model object
 *
 * @param {Kex} kex
 * @param {String} name
 * @param {Object} options
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
