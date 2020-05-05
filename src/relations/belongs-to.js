const DataLoader = require('dataloader')
const pluralize = require('pluralize')
const snakeCase = require('lodash.snakecase')
const { mapTo, prop, noop } = require('../utils')

/** @typedef {import('../model').Model} Model */

/**
 * @callback DataLoader
 * @param {Object} item
 * @return {Promise<Object>}
 */

class BelongsTo {
  /**
   * @param {String} related
   * @param {String} foreignKey
   * @param {String} otherKey
   */
  constructor (related, foreignKey, otherKey) {
    this.related = related
    this.foreignKey = foreignKey
    this.otherKey = otherKey
  }

  /**
   * @param {String} parentModel
   * @param {import('../kex')} kex
   * @param {import('../query-builder').Scope} [scope]
   * @return {DataLoader}
   */
  createDataLoader (parentModel, kex, scope = noop) {
    const Related = kex.getModel(this.related)
    const foreignKey = this.getForeignKeyName(Related)
    const otherKey = this.otherKey || 'id'
    const loader = new DataLoader(keys => {
      const query = Related.query()
        .whereIn(otherKey, keys)

      scope(query)

      return query.then(mapTo(keys, prop(otherKey)))
    })

    return model => loader.load(model[foreignKey])
  }

  /**
   * @param {Model} Related
   * @return {String}
   * @private
   */
  getForeignKeyName (Related) {
    return this.foreignKey || snakeCase(`${pluralize.singular(Related.tableName)} id`)
  }
}

module.exports = BelongsTo
