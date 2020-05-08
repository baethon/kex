const flow = require('lodash.flow')
const { isObject } = require('../utils')

const setDateField = (name) => item => ({
  ...item,
  [name]: new Date()
})

/**
 * @param {import('../model')} Model
 */
module.exports = (Model) => {
  const { timestamps = false } = Model.options

  if (!timestamps) {
    return
  }

  const { QueryBuilder } = Model
  const timestampsOptions = isObject(timestamps)
    ? timestamps
    : {}

  const {
    createdAtColumn = 'created_at',
    updatedAtColumn = 'updated_at'
  } = timestampsOptions

  const {
    insert: insertMethod,
    update: updateMethod
  } = QueryBuilder.prototype

  const setUpdatedAt = setDateField(updatedAtColumn)
  const setCreatedAt = setDateField(createdAtColumn)

  QueryBuilder.extend({
    methodName: 'update',
    force: true,
    fn (values, returning) {
      return updateMethod.call(this, setUpdatedAt(values), returning)
    }
  })

  QueryBuilder.extend({
    methodName: 'insert',
    force: true,
    fn (values, returning) {
      const update = flow([
        setUpdatedAt,
        setCreatedAt
      ])

      const newValues = Array.isArray(values)
        ? values.map(update)
        : update(values)

      return insertMethod.call(this, newValues, returning)
    }
  })
}
