const Related = require('./include/related')
const { parseIncludes } = require('./include/include-parser')

/**
 * @param {import('../model').Model} Model
 */
module.exports = (Model) => {
  const { QueryBuilder } = Model
  const related = new Related(Model)

  QueryBuilder.prototype.include = function (...args) {
    this.includes = {
      ...this.includes,
      ...parseIncludes(...args)
    }

    return this
  }

  const { then: thenMethod } = QueryBuilder.prototype

  QueryBuilder.prototype.then = function (resolve, reject) {
    return thenMethod.call(this)
      .then(results => related.fetchRelated(results, this.includes))
      .then(resolve)
      .catch(reject)
  }
}
