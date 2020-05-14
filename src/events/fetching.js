const Event = require('./event')
const Fetched = require('./fetched')

class Fetching extends Event {
  static get eventName () {
    return 'fetching'
  }

  /**
   * @param {import('knex/lib/query/builder')} queryBuilder
   */
  constructor (queryBuilder) {
    super()

    this.queryBuilder = queryBuilder
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
