const Event = require('./event')
const Deleted = require('./deleted')

class Deleting extends Event {
  static get eventName () {
    return 'deleting'
  }

  /**
   * @param {String|String[]} returning
   */
  constructor (returning) {
    super()
    this.returning = returning
  }

  mutateQueryBuilder (qb) {
    qb._single.returning = this.returning
  }

  /**
   * @inheritdoc
   */
  toAfterEvent (results) {
    return new Deleted(results)
  }
}

module.exports = Deleting
