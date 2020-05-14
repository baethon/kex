const Event = require('./event')
const Updated = require('./updated')

class Updating extends Event {
  static get eventName () {
    return 'updating'
  }

  /**
   * @param {import('knex/lib/query/builder')} queryBuilder
   * @param {Object|Object[]} values
   * @param {String|String[]} returning
   */
  constructor (queryBuilder, values, returning) {
    super()

    this.queryBuilder = queryBuilder
    this.values = values
    this.returning = returning
  }

  /**
   * @inheritdoc
   */
  toAfterEvent (results) {
    return new Updated(results, this.values)
  }
}

module.exports = Updating
