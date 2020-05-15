const BaseQueryBuilder = require('knex/lib/query/builder')
const { KexError } = require('./errors')
const { FetchingEvent, UpdatingEvent } = require('./events')

/** @typedef { import('knex/lib/client') } KnexClient */
/** @typedef { import('./model') } Model */
/** @typedef { import('./events/pipeline') } EventsPipeline */

/**
 * @callback Scope
 * @param {QueryBuilder} qb
 * @param {...*} args
 */

const toScope = (fn) => function (...args) {
  fn(this, ...args)
  return this
}

class QueryBuilder extends BaseQueryBuilder {
  /**
   * Create instance of QueryBuilder
   *
   * @param {KnexClient} client Knex client
   * @return {QueryBuilder}
   */
  static create (client) {
    const qb = new this(client)

    return BaseQueryBuilder.prototype.table.call(qb, this.tableName)
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
   * @param {String} name
   * @param {Scope} fn
   */
  static addScope (name, fn) {
    this.extend({
      methodName: name,
      fn: toScope(fn)
    })
  }

  /**
   * @param {Object} options
   * @param {String} options.methodName
   * @param {Function} options.fn
   * @param {Boolean} [options.force=false]
   */
  static extend (options) {
    const { methodName, fn, force = false } = options

    if (!force && methodName in this.prototype) {
      throw new KexError(`Method [${methodName}] is already defined in QueryBuilder`)
    }

    this.prototype[methodName] = fn
  }

  /**
   * @return {Model}
   * @abstract
   */
  static get Model () {
    throw new KexError('The Model getter is not implemented')
  }

  /**
   * @inheritdoc
   */
  constructor (client) {
    super(client)

    /** @type {Set<String>} */
    this.ignoredScopes = new Set()

    /** @type {EventsPipeline} */
    this.events = this.constructor.Model.events.clone()

    this.toEmit = {
      event: new FetchingEvent(this)
    }
  }

  table () {
    throw new KexError('Can\'t use table() in models query builder')
  }

  newInstance () {
    const Builder = this.constructor
    return new Builder(this.client)
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

  /**
   * @inheritdoc
   */
  whereWrapped (callback) {
    return BaseQueryBuilder.prototype.whereWrapped.call(this, (qb) => {
      const builder = this.newInstance()
      callback.call(builder, builder)

      // now the magic - builder and qb are different instances
      // knex will use `qb` to build the query
      // since we passed `builder` to the callback we need to merge
      // it with the `qb`
      Object.assign(qb, builder)
    })
  }

  update (values, returning) {
    this.toEmit.event = new UpdatingEvent(this, values, returning)

    return super.update(values, returning)
  }

  async then () {
    const { event } = this.toEmit

    await this.events.emit(event)

    if (event.cancelled) {
      return undefined
    }

    const results = await super.then()
    const afterEvent = event.toAfterEvent(results)

    await this.events.emit(afterEvent)

    return afterEvent.results
  }
}

/**
 * Create the a new child class of QueryBuilder
 *
 * @param {Model} Model
 * @returns {typeof QueryBuilder}
 */
const createChildClass = (Model) => {
  class ChildQueryBuilder extends QueryBuilder {
    static get tableName () {
      return this.Model.tableName
    }

    /**
     * @return {Model}
     */
    static get Model () {
      return Model
    }
  }

  ChildQueryBuilder.globalScopes = {}

  return ChildQueryBuilder
}

module.exports = { createChildClass }
