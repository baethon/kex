const pluralize = require('pluralize')
const snakeCase = require('lodash.snakecase')
const QueryBuilder = require('./query-builder')

const getTableName = (modelName, { tableName }) => {
  return tableName || snakeCase(pluralize.plural(modelName))
}

const createModel = (kex, name, options) => {
  const tableName = getTableName(name, options)
  const builder = QueryBuilder.createChildClass(tableName, options)

  return {
    get QueryBuilder () {
      return builder
    },

    query () {
      const { knex } = this.kex
      return this.QueryBuilder.create(knex.client)
    },

    get name () {
      return name
    },

    get kex () {
      return kex
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
