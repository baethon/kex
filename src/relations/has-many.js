const DataLoader = require('dataloader')
const Relation = require('./relation')
const { mapToMany, prop, noop, requiredArgument } = require('../utils')

/** @typedef {import('../model')} Model */

/**
 * @callback DataLoader
 * @param {Object} item
 * @return {Promise<Object[]>}
 */

class HasMany extends Relation {
  /**
   * @param {String} related
   * @param {Object} [options]
   * @param {String} [options.foreignKey]
   * @param {String} [options.localKey]
   */
  constructor (related, options = {}) {
    super()

    const { foreignKey, localKey } = options

    this.related = related
    this.foreignKey = foreignKey
    this.localKey = localKey
  }

  /**
   * @param {Model} Model
   * @param {import('../query-builder').Scope} [scope]
   * @return {DataLoader}
   */
  createDataLoader (Model, scope = noop) {
    const {
      Related,
      foreignKey,
      localKey
    } = this.getRelationConfig(Model)

    const loader = new DataLoader(keys => {
      return Related.query()
        .whereIn(foreignKey, keys)
        .modify(scope)
        .then(mapToMany(keys, prop(foreignKey)))
    })

    return model => loader.load(model[localKey])
  }

  /**
   * @return {String}
   * @private
   */
  getLocalKey () {
    return this.localKey || 'id'
  }

  /**
   * @param {Model} Model
   * @return {Object}
   */
  getRelationConfig (Model) {
    const { kex } = Model

    const Related = kex.getModel(this.related)

    return {
      Related,
      foreignKey: this.foreignKey || this.getForeignKeyName(Model),
      localKey: this.getLocalKey()
    }
  }

  /**
   * @param {Model} Model
   * @param {*} parentKey
   * @return {import('knex/lib/query/builder')}
   */
  queryForSingle (Model, parentKey = requiredArgument('parentKey')) {
    const { Related, foreignKey } = this.getRelationConfig(Model)

    return Related.query()
      .where(foreignKey, parentKey)
  }
}

module.exports = HasMany
