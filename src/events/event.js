const { KexError } = require('../errors')

class Event {
  static get eventName () {
    throw new KexError('Event name should be set in child class')
  }

  constructor () {
    this.cancelled = false
  }

  cancel () {
    this.cancelled = true
  }
}

module.exports = Event
