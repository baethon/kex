const { ModelNotFound } = require('../errors')

/**
 * @param {import('../model').Model} Model
 */
module.exports = (Model) => {
  Model.QueryBuilder.addMacro('firstOrFail', async function (columns) {
    const model = await this.first(columns)

    if (!model) {
      throw ModelNotFound.firstOrFail(Model)
    }

    return model
  })
}
