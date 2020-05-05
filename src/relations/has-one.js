const DataLoader = require('dataloader')
const { mapTo, prop, noop } = require('../utils')
const Relation = require('./relation')

/**
 * @callback DataLoader
 * @param {Object} item
 * @return {Promise<Object>}
 */

class HasOne extends Relation {
  /**
   * @param {String} related
   * @param {String} foreignKey
   * @param {String} localKey
   */
  constructor (related, foreignKey, localKey) {
    super()
    this.related = related
    this.foreignKey = foreignKey
    this.localKey = localKey
  }

  /**
   * @param {String} parentModel
   * @param {import('../kex')} kex
   * @param {import('../query-builder').Scope} [scope]
   * @return {DataLoader}
   */
  createDataLoader (parentModel, kex, scope = noop) {
    const Model = kex.getModel(this.related)
    const Parent = kex.getModel(parentModel)
    const foreignKey = this.foreignKey || this.getForeignKeyName(Parent)
    const localKey = this.getLocalKey()
    const loader = new DataLoader(keys => {
      const query = Model.query()
        .whereIn(foreignKey, keys)

      scope(query)

      return query.then(mapTo(keys, prop(foreignKey)))
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
}

module.exports = HasOne
