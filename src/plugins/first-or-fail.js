const { ModelNotFound } = require('../errors')

/**
 * @param {import('../model').Model} Model
 * @param {import('../kex').ModelOptions} options
 */
module.exports = (Model, options) => {
  Model.QueryBuilder.prototype.firstOrFail = function (columns) {
    return this.first(columns)
      .then(model => {
        if (!model) {
          throw ModelNotFound.firstOrFail(Model)
        }

        return model
      })
  }
}
