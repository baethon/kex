const BaseQueryBuilder = require('knex/lib/query/builder')
const { KexError } = require('./errors')
const { toScope } = require('./utils')

/** @typedef { import('knex/lib/client') } KnexClient */

/**
 * @callback Scope
 * @param {QueryBuilder} qb
 * @param {...*} args
 */

class QueryBuilder extends BaseQueryBuilder {
  /**
   * Create instance of QueryBuilder
   *
   * @param {KnexClient} client Knex client
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
   * Set list of models global scopes
   *
   * @param {Object<String, Scope>} scopesList
   * @return {QueryBuilder}
   */
  static setGlobalScopes (scopesList) {
    Object.entries(scopesList)
      .forEach(([name, fn]) => this.addGlobalScope(name, fn))

    return this
  }

  /**
   * Add a global scope to the model
   *
   * @param {String} name
   * @param {Scope} fn
   */
  static addGlobalScope (name, fn) {
    this.globalScopes[name] = toScope(fn)
  }

  static addMacro (name, fn, options = {}) {
    const { force = false } = options

    if (!force && name in this.prototype) {
      throw new KexError(`Method [${name}] is already defined in QueryBuilder`)
    }

    this.prototype[name] = fn
  }

  /**
   * @inheritdoc
   */
  constructor (client) {
    super(client)

    /** @type {Set<String>} */
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
   * @param {String[]} [namesList] when empty, method will exclude all global scopes
   * @return {QueryBuilder}
   */
  withoutGlobalScopes (namesList) {
    const list = namesList || Object.keys(this.constructor.globalScopes)

    list.forEach(name => this.withoutGlobalScope(name))
    return this
  }
}

/**
 * Create the a new child class of QueryBuilder
 *
 * @param {String} tableName
 * @param {Object} options
 * @returns {QueryBuilder}
 */
const createChildClass = (tableName, options) => {
  const { globalScopes = {} } = options

  class ChildQueryBuilder extends QueryBuilder {
    static get tableName () {
      return tableName
    }
  }

  ChildQueryBuilder.globalScopes = {}

  return ChildQueryBuilder.setGlobalScopes(globalScopes)
}

module.exports = { createChildClass }
