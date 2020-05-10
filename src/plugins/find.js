const { ModelNotFound } = require('../errors')

/**
 * @param {import('../model')} Model
 */
module.exports = (Model) => {
  const { primaryKey } = Model

  Model.extend({
    methodName: 'find',
    fn (id) {
      return this.query()
        .withoutGlobalScopes()
        .where(primaryKey, id)
        .first()
    }
  })

  Model.extend({
    methodName: 'findOrFail',
    fn (id) {
      return this.find(id)
        .then(model => {
          if (!model) {
            throw ModelNotFound.findOrFail(Model, { primaryKey, value: id })
          }

          return model
        })
    }
  })
}
