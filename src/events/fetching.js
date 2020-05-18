const Event = require('./event')
const Fetched = require('./fetched')

class Fetching extends Event {
  static get eventName () {
    return 'fetching'
  }

  /**
   * @param {*} results
   * @return {import('./fetched')}
   */
  toAfterEvent (results) {
    return new Fetched(results)
  }
}

module.exports = Fetching
