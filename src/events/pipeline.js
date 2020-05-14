/** @typedef {Map<String, Function[]>} Listeners */
/** @typedef { import('./event') } Event */

class EventsPipeline {
  /**
   * @param {Array} listeners entries for listeners mapTo
   */
  constructor (listeners = []) {
    /** @type {Listeners} */
    this.listeners = new Map(listeners)
  }

  /**
   * @param {String} eventName
   * @param {Function} listener
   * @return {Function} a callback which removes the listener
   */
  on (eventName, listener) {
    const list = this.listeners.get(eventName) || []
    this.listeners.set(eventName, list.concat(listener))

    return () => {
      const list = this.listeners.get(eventName)
      const index = list.indexOf(listener)

      if (index >= 0) {
        list.splice(index, 1)
        this.listeners.set(eventName, list)
      }
    }
  }

  /**
   * Execute all listeners of given event.
   *
   * The listeners are called serially.
   *
   * @param {Event} event
   * @return {Promise<Boolean>} the result of calling the listener;
   *                            FALSE indicates that event was cancelled
   */
  async emit (event) {
    const { eventName } = event.constructor
    const list = this.listeners.get(eventName) || []

    for (let i = 0; i < list.length; i++) {
      await list[i](event)

      if (event.cancelled) {
        return false
      }
    }

    return true
  }

  /**
   * Create copy of current instance.
   *
   * This method makes sure that all lists are dereferenced.
   *
   * @return {EventsPipeline}
   */
  clone () {
    const entries = Array.from(this.listeners.entries())

    return new this.constructor(entries.map(([name, listeners]) => ([
      name,
      [...listeners]
    ])))
  }
}

module.exports = EventsPipeline
