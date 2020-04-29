const BaseQueryBuilder = require('knex/lib/query/builder')

const toScope = fn => function (...args) {
  return this.where(qb => fn(qb, ...args))
}

class QueryBuilder extends BaseQueryBuilder {
  static create (client) {
    const Builder = this

    // Knex client is used as a factory for creating various objects.
    // We need to make a shallow copy of the client which will
    // return the custom QueryBuilder instance.
    const localClient = Object.assign(
      Object.create(Object.getPrototypeOf(client)),
      client,
      {
        queryBuilder () {
          return new Builder(this)
        }
      }
    )

    const qb = new this(localClient)

    return qb.table(this.tableName)
  }

  static setScopes (scopesList) {
    Object.entries(scopesList)
      .forEach(([name, fn]) => this.addScope(name, fn))

    return this
  }

  static setGlobalScopes (scopesList) {
    Object.entries(scopesList)
      .forEach(([name, fn]) => this.addGlobalScope(name, fn))

    return this
  }

  static addScope (name, fn) {
    this.prototype[name] = toScope(fn)
  }

  static addGlobalScope (name, fn) {
    this.globalScopes[name] = toScope(fn)
  }

  toSQL (method, tz) {
    Object.entries(this.constructor.globalScopes)
      .forEach(([name, scope]) => scope.call(this))

    return super.toSQL(method, tz)
  }
}

QueryBuilder.globalScopes = {}

const createChildClass = (tableName, options) => {
  const { scopes = {}, globalScopes = {} } = options

  class ChildQueryBuilder extends QueryBuilder {
    static get tableName () {
      return tableName
    }
  }

  return ChildQueryBuilder.setScopes(scopes)
    .setGlobalScopes(globalScopes)
}

module.exports = { createChildClass }
