const KexError = require('./kex-error')

const getBaseMessage = Model => `No query results for model [${Model.name}]`

class ModelNotFound extends KexError {
  static findOrFail (Model, { primaryKey, value }) {
    return new this(`${getBaseMessage(Model)} (${primaryKey}:${value})`)
  }
}

module.exports = ModelNotFound
