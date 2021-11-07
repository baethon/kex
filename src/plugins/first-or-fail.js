const { ModelNotFound } = require('../errors')

/**
 * @param {import('../model')} Model
 */
module.exports = (Model) => {
  Model.QueryBuilder.extend({
    methodName: 'firstOrFail',
    async fn (...args) {
      const model = await this.first(...args)

      if (!model) {
        throw ModelNotFound.firstOrFail(Model)
      }

      return model
    }
  })
}
