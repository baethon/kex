const pluralize = require('pluralize')
const snakeCase = require('lodash.snakecase')
const { setClassName } = require('./utils')
const QueryBuilder = require('knex/lib/query/builder')

const getTableName = (modelName, { tableName }) => {
  return tableName || snakeCase(pluralize.plural(modelName))
}

module.exports = (knex, name, options) => {
  const tableName = getTableName(name, options)

  const Query = class {
    static query () {
      const queryBuilder = new QueryBuilder(knex.client)
      return queryBuilder.table(tableName)
    }
  }

  setClassName(Query, name)

  return Query
}
