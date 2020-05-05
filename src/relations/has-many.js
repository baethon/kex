const DataLoader = require('dataloader')
const Relation = require('./relation')
const { mapToMany, prop, noop } = require('../utils')

/**
 * @callback DataLoader
 * @param {Object} item
 * @return {Promise<Object[]>}
 */

class HasMany extends Relation {
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

      return query.then(mapToMany(keys, prop(foreignKey)))
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

module.exports = HasMany
