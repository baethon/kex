const isObject = value => Object.prototype.toString.call(value) === '[object Object]'

/**
 * @typedef {Object} SoftDeleteOptions
 * @property {String} [columnName=deleted_at]
 */

/**
 * @param {import('../model').Model} Model
 * @param {import('../kex').ModelOptions} options
 */
module.exports = (Model, options) => {
  const { softDeletes = false } = options

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

  Model.QueryBuilder.prototype.trash = function (ret) {
    this.update({ [columnName]: new Date() })

    if (ret) {
      this.returning(ret)
    }

    return this
  }

  const { delete: deleteMethod } = Model.QueryBuilder.prototype

  Model.QueryBuilder.prototype.delete = function (ret, options = {}) {
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

  Model.QueryBuilder.prototype.restore = function () {
    return this.withoutGlobalScope('soft-deletes')
      .update({
        [columnName]: null
      })
  }
}
