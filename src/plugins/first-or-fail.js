const { ModelNotFound } = require('../errors')

/**
 * @param {import('../model')} Model
 */
module.exports = (Model) => {
  Model.QueryBuilder.extend({
    methodName: 'firstOrFail',
    async fn (columns) {
      const model = await this.first(columns)

      if (!model) {
        throw ModelNotFound.firstOrFail(Model)
      }

      return model
    }
  })
}
