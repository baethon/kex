const DataLoader = require('dataloader')

const { mapTo, prop, noop } = require('../utils')
const Relation = require('./relation')

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
   * @param {import('../model')} Model
   * @param {import('../query-builder').Scope} [scope]
   * @return {DataLoader}
   */
  createDataLoader (Model, scope = noop) {
    const { kex } = Model

    const Related = kex.getModel(this.related)
    const foreignKey = this.foreignKey || this.getForeignKeyName(Related)
    const otherKey = this.otherKey || 'id'
    const loader = new DataLoader(keys => {
      const query = Related.query()
        .whereIn(otherKey, keys)

      scope(query)

      return query.then(mapTo(keys, prop(otherKey)))
    })

    return model => loader.load(model[foreignKey])
  }
}

module.exports = BelongsTo
