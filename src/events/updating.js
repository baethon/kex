const Event = require('./event')
const Updated = require('./updated')

class Updating extends Event {
  static get eventName () {
    return 'updating'
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
    qb._single.update = this.values
    qb._single.returning = this.returning
  }

  /**
   * @inheritdoc
   */
  toAfterEvent (results) {
    return new Updated(results, this.values)
  }
}

module.exports = Updating
