const BaseQueryBuilder = require('knex/lib/query/builder')

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

    return new this(localClient)
  }

  static addScope (name, fn) {
    this.prototype[name] = function (...args) {
      return this.where(qb => fn(qb, ...args))
    }
  }
}

const createChildClass = () => {
  return class extends QueryBuilder {}
}

module.exports = { createChildClass }
