const Event = require('./event')

class Deleted extends Event {
  static get eventName () {
    return 'deleted'
  }

  /**
   * @param {*} results
   */
  constructor (results) {
    super()

    this.result = results
  }
}

module.exports = Deleted
