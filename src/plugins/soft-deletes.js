const isObject = value => Object.prototype.toString.call(value) === '[object Object]'

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
}
