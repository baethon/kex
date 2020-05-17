const Related = require('./related')
const { parseIncludes } = require('./parser')

/**
 * @param {import('../../model')} Model
 */
module.exports = (Model) => {
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

  Model.on('fetched', async function (event) {
    event.results = await related.fetchRelated(event.results, this.includes)
  })
}
