const Related = require('./related')
const { parseIncludes } = require('./parser')

/**
 * @param {import('../../model')} Model
 */
module.exports = (Model) => {
  const { QueryBuilder } = Model
  const related = new Related(Model)

  Model.QueryBuilder.extend({
    methodName: 'include',
    fn (...args) {
      this.includes = {
        ...this.includes,
        ...parseIncludes(...args)
      }

      return this
    }
  })

  const { then: thenMethod } = QueryBuilder.prototype

  QueryBuilder.extend({
    methodName: 'then',
    force: true,
    fn (resolve, reject) {
      return thenMethod.call(this)
        .then(results => related.fetchRelated(results, this.includes))
        .then(resolve)
        .catch(reject)
    }
  })
}
