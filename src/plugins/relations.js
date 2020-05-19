/**
 * @param {import('../model')} Model
 */
module.exports = (Model) => {
  const relations = Object.entries(Model.options.relations || {})

  if (!relations.length) {
    return
  }

  relations.forEach(([name, relation]) => {
    Model.extend({
      methodName: name,
      fn (parentKey) {
        return relation.queryForSingle(this, parentKey)
      }
    })
  })
}
