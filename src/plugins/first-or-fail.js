const { ModelNotFound } = require('../errors')

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
