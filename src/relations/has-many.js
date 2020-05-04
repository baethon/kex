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

class HasMany {
  /**
   * @param {String} relatedModel
   */
  constructor (relatedModel) {
    this.relatedModel = relatedModel
  }

  /**
   * @param {String} parentModel
   * @param {import('../kex')} kex
   * @return {DataLoader}
   */
  createDataLoader (parentModel, kex) {
    const Model = kex.getModel(this.relatedModel)
    const Parent = kex.getModel(parentModel)
    const foreignKey = this.getForeignKeyName(Parent)
    const loader = new DataLoader(keys => Model.query()
      .whereIn(foreignKey, keys)
      .then(mapToMany(keys, prop(foreignKey)))
    )

    return model => loader.load(model.id)
  }

  /**
   * @param {Model} Model
   * @return {String}
   * @private
   */
  getForeignKeyName (Model) {
    const { tableName } = Model

    return snakeCase(`${pluralize.singular(tableName)} id`)
  }
}

module.exports = HasMany
