const pluralize = require('pluralize')
const snakeCase = require('lodash.snakecase')
const QueryBuilder = require('./query-builder')

const getTableName = (modelName, { tableName }) => {
  return tableName || snakeCase(pluralize.plural(modelName))
}

module.exports = (knex, name, options) => {
  const tableName = getTableName(name, options)

  const Model = {
    QueryBuilder: QueryBuilder.createChildClass(tableName, options),

    query () {
      return this.QueryBuilder.create(knex.client)
    }
  }

  return Model
}
