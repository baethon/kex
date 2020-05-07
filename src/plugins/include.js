const Related = require('./include/related')

/**
 * @param {import('../model').Model} Model
 */
module.exports = (Model) => {
  const { QueryBuilder } = Model
  const related = new Related(Model)

  QueryBuilder.prototype.include = function (relations) {
    this.includes = {
      ...this.includes,
      ...relations
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
