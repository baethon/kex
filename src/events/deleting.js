const Event = require('./event')
const Deleted = require('./deleted')

class Deleting extends Event {
  static get eventName () {
    return 'deleting'
  }

  /**
   * @param {import('knex/lib/query/builder')} queryBuilder
   * @param {String|String[]} returning
   */
  constructor (queryBuilder, returning) {
    super()

    this.queryBuilder = queryBuilder
    this.returning = returning
  }

  /**
   * @inheritdoc
   */
  toAfterEvent (results) {
    return new Deleted(results)
  }
}

module.exports = Deleting
