const BaseQueryBuilder = require('knex/lib/query/builder')
const { KexError } = require('./errors')
const { toScope } = require('./utils')

/** @typedef { import('knex/lib/client') } KnexClient */

/**
 * @callback Scope
 * @param {QueryBuilder} qb
 * @param {...*} args
 */

/**
 * @typedef {Object} ExtendOptions
 * @property {String} methodName
 * @property {Function} fn
 * @property {Boolean} [force=false]
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
   * Add a global scope to the model
   *
   * @param {String} name
   * @param {Scope} fn
   */
  static addGlobalScope (name, fn) {
    this.globalScopes[name] = toScope(fn)
  }

  /**
   * @param {ExtendOptions} options
   */
  static extend (options) {
    const { methodName, fn, force = false } = options

    if (!force && methodName in this.prototype) {
      throw new KexError(`Method [${methodName}] is already defined in QueryBuilder`)
    }

    this.prototype[methodName] = fn
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
 * @param {import('./model')} Model
 * @returns {typeof QueryBuilder}
 */
const createChildClass = (Model) => {
  class ChildQueryBuilder extends QueryBuilder {
    static get tableName () {
      return Model.tableName
    }
  }

  ChildQueryBuilder.globalScopes = {}

  return ChildQueryBuilder
}

module.exports = { createChildClass }
