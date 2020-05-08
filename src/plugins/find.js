const { ModelNotFound } = require('../errors')

/**
 * @param {import('../model').Model} Model
 */
module.exports = (Model) => {
  const { primaryKey } = Model

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
