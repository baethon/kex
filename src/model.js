const pluralize = require('pluralize')
const snakeCase = require('lodash.snakecase')
const QueryBuilder = require('./query-builder')

const getTableName = (modelName, { tableName }) => {
  return tableName || snakeCase(pluralize.plural(modelName))
}

const createModel = (knex, name, options) => {
  const tableName = getTableName(name, options)
  const builder = QueryBuilder.createChildClass(tableName, options)

  return {
    get QueryBuilder () {
      return builder
    },

    query () {
      return this.QueryBuilder.create(knex.client)
    },

    get name () {
      return name
    }
  }
}

const applyPlugins = function (plugins, Model, options) {
  plugins.forEach(fn => {
    fn(Model, options)
  })

  return Model
}

module.exports = { createModel, applyPlugins }
