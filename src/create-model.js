const pluralize = require('pluralize')
const snakeCase = require('lodash.snakecase')
const { setClassName } = require('./utils')
const QueryBuilder = require('./query-builder')

const getTableName = (modelName, { tableName }) => {
  return tableName || snakeCase(pluralize.plural(modelName))
}

const addScopes = (ModelQueryBuilder, { scopes = {} }) => {
  Object.entries(scopes)
    .forEach(([name, fn]) => {
      ModelQueryBuilder.addScope(name, fn)
    })
}

module.exports = (knex, name, options) => {
  const tableName = getTableName(name, options)

  const ModelQueryBuilder = QueryBuilder.createChildClass()
  const Model = class {
    static query () {
      const queryBuilder = ModelQueryBuilder.create(knex.client)
      return queryBuilder.table(tableName)
    }
  }

  setClassName(Model, name)
  addScopes(ModelQueryBuilder, options)

  return Model
}
