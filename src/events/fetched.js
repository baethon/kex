const Event = require('./event')

class Fetched extends Event {
  static get eventName () {
    return 'fetched'
  }

  /**
   * @param {Object|Object[]} results
   */
  constructor (results) {
    super()

    this.results = results
  }
}

module.exports = Fetched
