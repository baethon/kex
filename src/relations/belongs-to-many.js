const DataLoader = require('dataloader')
const pluralize = require('pluralize')
const Relation = require('./relation')
const {
  mapToMany,
  prop,
  noop,
  omit,
  requiredArgument
} = require('../utils')

/** @typedef {import('../model')} Model */
/** @typedef {import('knex/lib/query/builder')} QueryBuilder */

/**
 * @typedef {Object} RelationConfig
 * @property {Model} Related
 * @property {String} foreignPivotKey
 * @property {String} table
 * @property {String} parentKey
 * @property {String} relatedPivotKey
 * @property {String} relatedKey
 */

const omitPivotFields = item => omit(item, ['pivot__foreign_id'])

class BelongsToMany extends Relation {
  /**
   * @param {String} related
   * @param {Object} [options]
   * @param {String} [options.table]
   * @param {String} [options.foreignPivotKey] the key used in the pivot table,
   *                                           referencing the parent model
   * @param {String} [options.relatedPivotKey] the key used in the pivot table,
   *                                           referencing the related model
   * @param {String} [options.parentKey]       the parent model key used
   *                                           to retrieve the related models
   * @param {String} [options.relatedKey]      the related model key
   */
  constructor (related, options = {}) {
    super()

    this.related = related
    this.options = options
  }

  /**
   * @param {Model} Model
   * @param {import('../query-builder').Scope} [scope]
   * @return {DataLoader}
   */
  createDataLoader (Model, scope = noop) {
    const relationConfig = this.getRelationConfig(Model)
    const {
      foreignPivotKey,
      table,
      parentKey
    } = relationConfig

    const loader = new DataLoader(keys => {
      return this.createQuery(Model, relationConfig)
        .whereIn(`${table}.${foreignPivotKey}`, keys)
        .modify(scope)
        .then(mapToMany(keys, prop('pivot__foreign_id')))
        .then(groupedRows => groupedRows.map(
          rows => rows.map(omitPivotFields)
        ))
    })

    return model => loader.load(model[parentKey])
  }

  /**
   * Create query used to fetch related models
   *
   * @param {Model} Model
   * @param {RelationConfig} relationConfig
   * @return {QueryBuilder}
   * @private
   */
  createQuery (Model, relationConfig = requiredArgument('relationConfig')) {
    const {
      Related,
      foreignPivotKey,
      table,
      relatedPivotKey,
      relatedKey
    } = relationConfig

    return Related.query()
      .join(table, `${table}.${relatedPivotKey}`, `${Related.tableName}.${relatedKey}`)
      .select(
        `${Related.tableName}.*`,
        `${table}.${foreignPivotKey} AS pivot__foreign_id`
      )
  }

  /**
   * @param {Model} Model
   * @param {*} parentKey the id of the item
   * @return {QueryBuilder}
   */
  queryForSingle (Model, parentKey = requiredArgument('parentKey')) {
    const relationConfig = this.getRelationConfig(Model)
    const {
      foreignPivotKey,
      table
    } = relationConfig

    return this.createQuery(Model, relationConfig)
      .where(`${table}.${foreignPivotKey}`, parentKey)
      .on('fetched', event => {
        event.results = event.results.map(omitPivotFields)
      })
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

  /**
   * Get the relation config
   *
   * @param {Model} Model
   * @return {RelationConfig}
   */
  getRelationConfig (Model) {
    const { options } = this
    const { kex } = Model
    const Related = kex.getModel(this.related)

    return {
      Related,
      foreignPivotKey: options.foreignPivotKey || this.getForeignKeyName(Model),
      table: options.table || this.getTableName(Model, Related),
      parentKey: options.parentKey || Model.primaryKey,
      relatedPivotKey: options.relatedPivotKey || this.getForeignKeyName(Related),
      relatedKey: options.relatedKey || Related.primaryKey
    }
  }
}

module.exports = BelongsToMany
