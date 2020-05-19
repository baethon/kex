const DataLoader = require('dataloader')

const { mapTo, prop, noop, requiredArgument } = require('../utils')
const Relation = require('./relation')

/** @typedef {import('../model')} Model */

/**
 * @callback DataLoader
 * @param {Object} item
 * @return {Promise<Object>}
 */

class BelongsTo extends Relation {
  /**
   * @param {String} related
   * @param {Object} [options]
   * @param {String} [options.foreignKey]
   * @param {String} [options.otherKey]
   */
  constructor (related, options = {}) {
    super()

    const { foreignKey, otherKey } = options

    this.related = related
    this.foreignKey = foreignKey
    this.otherKey = otherKey
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
      otherKey
    } = this.getRelationConfig(Model)

    const loader = new DataLoader(keys => {
      return Related.query()
        .whereIn(otherKey, keys)
        .modify(scope)
        .then(mapTo(keys, prop(otherKey)))
    })

    return model => loader.load(model[foreignKey])
  }

  /**
   * @param {Model} Model
   * @param {*} parentKey
   * @return {import('knex/lib/query/builder')}
   */
  queryForSingle (Model, parentKey = requiredArgument('parentKey')) {
    const {
      Related,
      otherKey
    } = this.getRelationConfig(Model)

    return Related.query()
      .where(otherKey, parentKey)
      .first()
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
      foreignKey: this.foreignKey || this.getForeignKeyName(Related),
      otherKey: this.otherKey || 'id'
    }
  }
}

module.exports = BelongsTo
