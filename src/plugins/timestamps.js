const flow = require('lodash.flow')

const setDateField = (name) => item => ({
  ...item,
  [name]: new Date()
})

/**
 * @typedef {Object} TimestampsOptions
 * @property {String} [createdAtColumn=created_at]
 * @property {String} [updatedAtColumn=updated_at]
 */

/** @type {TimestampsOptions} */
const defaults = {
  createdAtColumn: 'created_at',
  updatedAtColumn: 'updated_at'
}

/**
 * @param {import('../model')} Model
 */
module.exports = (Model) => {
  const { timestamps = false } = Model.options

  if (!timestamps) {
    return
  }

  const options = {
    ...defaults,
    ...timestamps
  }

  const setUpdatedAt = setDateField(options.updatedAtColumn)
  const setCreatedAt = setDateField(options.createdAtColumn)
  const setBothFields = flow([
    setUpdatedAt,
    setCreatedAt
  ])

  Model.on('updating', event => {
    event.values = setUpdatedAt(event.values)
  })

  Model.on('inserting', event => {
    const { values } = event

    event.values = Array.isArray(values)
      ? values.map(setBothFields)
      : setBothFields(values)
  })
}
