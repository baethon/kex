const DataLoader = require('dataloader')
const pluralize = require('pluralize')
const snakeCase = require('lodash.snakecase')
const { mapToMany, prop } = require('../utils')

/** @typedef {import('../model').Model} Model */

/**
 * @callback DataLoader
 * @param {Object} item
 * @return {Promise<Object|Object[]>}
 */

const noop = () => {}

class HasMany {
  /**
   * @param {String} related
   * @param {String} foreignKey
   * @param {String} localKey
   */
  constructor (related, foreignKey, localKey) {
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
    const foreignKey = this.getForeignKeyName(Parent)
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
   * @param {Model} Model
   * @return {String}
   * @private
   */
  getForeignKeyName (Model) {
    return this.foreignKey || snakeCase(`${pluralize.singular(Model.tableName)} id`)
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
