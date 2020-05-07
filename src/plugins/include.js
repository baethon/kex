const { KexError } = require('../errors')

/** @typedef { import('../model').Model } Model */

/**
 * @param {Model} Model
 * @return {Function}
 */
const dummyInclude = (Model) => () => {
  throw new KexError(`Model ${Model.name} has no relations`)
}

/**
 * @param {Object|Object[]} results
 * @param {Object.<String,Object>} includes
 * @param {Model} Model
 * @return {Promise.<Object|Object[]>}
 */
const fetchIncludes = async (results, includes, Model) => {
  if (!includes) {
    return results
  }

  const entries = Object.entries(includes)

  for (let i = 0; i < entries.length; i++) {
    const [name, scope] = entries[i]
    results = await fetchSingleInclude(results, name, scope, Model)
  }

  return results
}

/**
 * @param {Object|Object[]} results
 * @param {String} name
 * @param {Function} scope
 * @param {Model} model
 * @return {Promise.<Object|Object[]>}
 */
const fetchSingleInclude = async (results, name, scope, Model) => {
  const { relations } = Model.options
  const Relation = relations[name]
  const loader = loadForItem(
    Relation.createDataLoader(Model.name, Model.kex, scope),
    name
  )

  return Array.isArray(results)
    ? Promise.all(results.map(loader))
    : loader(results)
}

const loadForItem = (loader, name) => item => loader(item)
  .then(related => ({
    ...item,
    [name]: related
  }))

/**
 * @param {Model} Model
 * @param {import('../kex').ModelOptions} options
 */
module.exports = (Model, options) => {
  const { QueryBuilder } = Model

  if (!options.relations) {
    QueryBuilder.prototype.include = dummyInclude(Model)
    return
  }

  QueryBuilder.prototype.include = function (relations) {
    this.includes = {
      ...this.includes,
      ...relations
    }

    // @TODO validate if given relations exist

    return this
  }

  const { then: thenMethod } = QueryBuilder.prototype

  QueryBuilder.prototype.then = function (resolve, reject) {
    return thenMethod.call(this)
      .then(results => fetchIncludes(results, this.includes, Model))
      .then(resolve)
      .catch(reject)
  }
}
