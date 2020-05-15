const Event = require('./event')

class Inserted extends Event {
  static get eventName () {
    return 'inserted'
  }

  /**
   * @param {*} results
   * @param {Object|Object[]} values
   */
  constructor (results, values) {
    super()
    this.results = results
    this.values = values
  }
}

module.exports = Inserted
