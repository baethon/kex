const pluralize = require('pluralize')
const snakeCase = require('lodash.snakecase')
const { KexError } = require('../errors')

/** @typedef {import('../model').Model} Model */

/**
 * @callback DataLoader
 * @param {Object} item
 * @return {Promise<Object|Object[]>}
 */

class Relation {
  /**
   * @param {Model} Model
   * @return {String}
   * @private
   */
  getForeignKeyName (Model) {
    return snakeCase(`${pluralize.singular(Model.tableName)} id`)
  }

  /**
   * @param {import('../model').Model} Model
   * @param {import('../query-builder').Scope} [scope]
   * @return {DataLoader}
   */
  createDataLoader (Model, scope) {
    throw new KexError('The method createDataLoader() needs to be implemented in the child class')
  }
}

module.exports = Relation
