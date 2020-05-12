const { isObject } = require('../utils')

/**
 * @typedef {Object} SoftDeleteOptions
 * @property {String} [columnName=deleted_at]
 */

/**
 * @param {import('../model')} Model
 */
module.exports = (Model) => {
  const { softDeletes = false } = Model.options

  if (!softDeletes) {
    return
  }

  const { columnName = 'deleted_at' } = isObject(softDeletes)
    ? softDeletes
    : {}

  Model.QueryBuilder.addGlobalScope('soft-deletes', qb => {
    qb.whereNull(columnName)
  })

  Model.QueryBuilder.addScope('withTrashed', qb => {
    qb.withoutGlobalScope('soft-deletes')
  })

  Model.QueryBuilder.addScope('onlyTrashed', qb => {
    qb.withoutGlobalScope('soft-deletes')
    qb.whereNotNull(columnName)
  })

  Model.QueryBuilder.extend({
    methodName: 'trash',
    fn (ret) {
      this.update({ [columnName]: new Date() })

      if (ret) {
        this.returning(ret)
      }

      return this
    }
  })

  const { delete: deleteMethod } = Model.QueryBuilder.prototype

  Model.QueryBuilder.extend({
    methodName: 'delete',
    force: true,
    fn (ret, options = {}) {
      const returning = isObject(ret)
        ? undefined
        : ret

      const { trash = true } = isObject(ret)
        ? ret
        : options

      if (trash) {
        return this.trash(returning)
      }

      return deleteMethod.call(this, returning)
    }
  })

  Model.QueryBuilder.extend({
    methodName: 'restore',
    fn () {
      return this.withoutGlobalScope('soft-deletes')
        .update({
          [columnName]: null
        })
    }
  })
}
