const { ModelNotFound } = require('../errors')

/**
 * @param {import('../model').Model} Model
 * @param {import('../kex').ModelOptions} options
 */
module.exports = (Model, options) => {
  const { primaryKey = 'id' } = options

  Model.find = function (id) {
    return this.query()
      .where(primaryKey, id)
      .first()
  }

  Model.findOrFail = function (id) {
    return this.find(id)
      .then(model => {
        if (!model) {
          throw ModelNotFound.findOrFail(Model, { primaryKey, value: id })
        }

        return model
      })
  }
}
