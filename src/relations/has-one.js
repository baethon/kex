const { noop, requiredArgument } = require('../utils')
const HasMany = require('./has-many')

/** @typedef {import('./has-many').DataLoader} DataLoader */

class HasOne extends HasMany {
  /**
   * @inheritdoc
   */
  createDataLoader (Model, scope = noop) {
    const parentLoader = super.createDataLoader(Model, scope)

    return model => parentLoader(model)
      .then(results => results.shift() || null)
  }

  /**
   * @inheritdoc
   */
  queryForSingle (Model, parentKey = requiredArgument('parentKey')) {
    return super.queryForSingle(Model, parentKey)
      .first()
  }
}

module.exports = HasOne
