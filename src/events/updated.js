const Event = require('./event')

class Updated extends Event {
  static get eventName () {
    return 'updated'
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

module.exports = Updated
