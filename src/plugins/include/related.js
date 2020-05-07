const { KexError } = require('../../errors')

/** @typedef { import('../../model').Model } Model */
/** @typedef { import('../../query-builder').Scope } Scope */

class Related {
  /**
   * @param {Model} Model
   */
  constructor (Model) {
    this.Model = Model
  }

  /**
   * @param {Object|Object[]} rows
   * @param {Object.<String,Scope>} includes
   * @return {Promise.<Object|Object[]>}
   */
  async fetchRelated (rows, includes) {
    const entries = Object.entries(includes || {})

    if (!entries.length) {
      return rows
    }

    const singleItem = !Array.isArray(rows)
    const rowsToProcess = singleItem ? [rows] : rows

    // try to load the related items in parallel
    // the `fetchSingleRelation()` will return a list of "chunks" - objects that should be merged
    // directly into the corresponding row
    const chunks = await Promise.all(entries.map(
      ([name, scope]) => this.fetchSingleRelation(rowsToProcess, name, scope)
    ))

    const combined = rowsToProcess.map((row, i) => {
      return chunks.reduce(
        (carry, chunk) => ({
          ...carry,
          ...chunk[i]
        }),
        row
      )
    })

    return singleItem
      ? combined.shift()
      : combined
  }

  /**
   * @param {Object[]} rows
   * @param {String} name
   * @param {Scope} scope
   * @return {Promise.<Object[]>}
   * @private
   */
  async fetchSingleRelation (rows, name, scope) {
    const { relations = {} } = this.Model.options

    if (!(name in relations)) {
      throw new KexError(`Relation [${name}] is not defined in ${this.Model.name} model`)
    }

    const Relation = relations[name]
    const loader = Relation.createDataLoader(this.Model, scope)

    return Promise.all(rows.map(
      item => loader(item)
        .then(related => ({
          [name]: related
        }))
    ))
  }
}

module.exports = Related
