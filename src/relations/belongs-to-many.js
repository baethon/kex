const DataLoader = require('dataloader')
const pluralize = require('pluralize')
const Relation = require('./relation')
const { mapToMany, prop, noop, omit } = require('../utils')

/** @typedef {import('../model').Model} Model */

/**
 * @typedef {Object} Options
 * @property {String} [table]
 */

const omitPivotFields = groupedRows => groupedRows.map(
  rows => rows.map(
    item => omit(item, ['pivot__foreign_id'])
  )
)

class BelongsToMany extends Relation {
  /**
   * @param {String} related
   * @param {Options} options
   */
  constructor (related, options) {
    super()

    this.related = related
    this.options = options
  }

  /**
   * @param {String} model
   * @param {import('../kex')} kex
   * @param {import('../query-builder').Scope} [scope]
   * @return {DataLoader}
   */
  createDataLoader (model, kex, scope = noop) {
    const Model = kex.getModel(model)
    const foreignPivotKey = this.getForeignKeyName(Model)

    const Related = kex.getModel(this.related)
    const relatedPivotKey = this.getForeignKeyName(Related)

    const table = this.options.table || this.getTableName(Model, Related)

    const loader = new DataLoader(keys => {
      const query = Related.query()
        .join(table, `${table}.${relatedPivotKey}`, `${Related.tableName}.${Related.primaryKey}`)
        .select(
          `${Related.tableName}.*`,
          `${table}.${foreignPivotKey} AS pivot__foreign_id`
        )
        .whereIn('pivot__foreign_id', keys)

      scope(query)

      return query.then(mapToMany(keys, prop('pivot__foreign_id')))
        .then(omitPivotFields)
    })

    return model => loader.load(model[Model.primaryKey])
  }

  /**
   * @param {Model} Model
   * @param {Model} Related
   * @return {String}
   */
  getTableName (Model, Related) {
    const names = [Model.tableName, Related.tableName]

    return names.map(name => pluralize.singular(name))
      .sort()
      .join('_')
  }
}

module.exports = BelongsToMany
