const BaseQueryBuilder = require('knex/lib/query/builder')

const toScope = (fn) => function (...args) {
  fn(this, ...args)
  return this
}

class QueryBuilder extends BaseQueryBuilder {
  /**
   * Create instance of QueryBuilder
   *
   * @param {Object} client Knex client
   * @return {QueryBuilder}
   */
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

  /**
   * Set list of query scopes
   *
   * @param {Object<String, Function>} scopesList
   * @return {QueryBuilder}
   */
  static setScopes (scopesList) {
    Object.entries(scopesList)
      .forEach(([name, fn]) => this.addScope(name, fn))

    return this
  }

  /**
   * Set list of models global scopes
   *
   * @param {Object<String, Function>} scopesList
   * @return {QueryBuilder}
   */
  static setGlobalScopes (scopesList) {
    Object.entries(scopesList)
      .forEach(([name, fn]) => this.addGlobalScope(name, fn))

    return this
  }

  /**
   * Add a query scope to the model
   *
   * @param {String} name
   * @param {Function} fn
   */
  static addScope (name, fn) {
    this.prototype[name] = toScope(fn)
  }

  /**
   * Add a global scope to the model
   *
   * @param {String} name
   * @param {Function} fn
   */
  static addGlobalScope (name, fn) {
    this.globalScopes[name] = toScope(fn)
  }

  /**
   * @inheritdoc
   */
  constructor (client) {
    super(client)
    this.ignoredScopes = new Set()
  }

  /**
   * @inheritdoc
   */
  toSQL (method, tz) {
    Object.entries(this.constructor.globalScopes)
      .filter(([name]) => !this.ignoredScopes.has(name))
      .forEach(([name, scope]) => scope.call(this))

    return super.toSQL(method, tz)
  }

  /**
   * Exclude selected global scope from the query
   *
   * @param {String} name
   * @return {QueryBuilder}
   */
  withoutGlobalScope (name) {
    if (!(name in this.constructor.globalScopes)) {
      throw new Error(`Scope [${name}] is not defined in global scopes`)
    }

    this.ignoredScopes = this.ignoredScopes.add(name)
    return this
  }

  /**
   * Exclude list of global scopes from the query
   *
   * @param {Array} [namesList] when empty, method will exclude all global scopes
   * @return {QueryBuilder}
   */
  withoutGlobalScopes (namesList) {
    const list = namesList || Object.keys(this.constructor.globalScopes)

    list.forEach(name => this.withoutGlobalScope(name))
    return this
  }
}

const createChildClass = (tableName, options) => {
  const { scopes = {}, globalScopes = {} } = options

  class ChildQueryBuilder extends QueryBuilder {
    static get tableName () {
      return tableName
    }
  }

  ChildQueryBuilder.globalScopes = {}

  return ChildQueryBuilder.setScopes(scopes)
    .setGlobalScopes(globalScopes)
}

module.exports = { createChildClass }
