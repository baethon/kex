const { KexError } = require('../errors')

class Event {
  static get eventName () {
    throw new KexError('Event name should be set in child class')
  }

  constructor () {
    this.cancelled = false
    this.emitted = false
  }

  cancel () {
    this.cancelled = true
  }

  markEmitted () {
    this.emitted = true
  }

  /**
   * @param {*} results
   * @return {Event}
   */
  toAfterEvent (results) {
    throw new KexError('toAfterEvent() should be implemented in the child class')
  }
}

module.exports = Event
