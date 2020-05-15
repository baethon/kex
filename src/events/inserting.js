const Event = require('./event')
const Inserted = require('./inserted')

class Inserting extends Event {
  static get eventName () {
    return 'inserting'
  }

  /**
   * @param {Object|Object[]} values
   * @param {String|String[]} returning
   */
  constructor (values, returning) {
    super()

    this.values = values
    this.returning = returning
  }

  mutateQueryBuilder (qb) {
    qb._single.insert = this.values
    qb._single.returning = this.returning
  }

  /**
   * @inheritdoc
   */
  toAfterEvent (results) {
    return new Inserted(results, this.values)
  }
}

module.exports = Inserting
