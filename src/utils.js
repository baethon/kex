/**
 * @param {Object} object
 * @param {String[]} props
 * @return {Object}
 */
const omit = (object, props) => props.reduce(
  (carry, name) => {
    delete carry[name]
    return carry
  },
  { ...object }
)

/**
 * Map results of query to DataLoader-friendly format
 *
 * @param {String[]} keys
 * @param {Function} keyFn the function used to get the key from result row
 * @return {Object[]}
 */
const mapTo = (keys, keyFn) => (rows) => {
  const group = new Map(keys.map(key => ([key, null])))
  rows.forEach(row => group.set(keyFn(row), row))
  return Array.from(group.values())
}

/**
 * Map results of query to DataLoader-friendly format.
 * Group them by the key.
 *
 * @param {String[]} keys
 * @param {Function} keyFn the function used to get the key from result row
 * @return {Array.<Object[]>}
 */
const mapToMany = (keys, keyFn) => (rows) => {
  const group = new Map(keys.map(key => ([key, []])))
  rows.forEach(row => (group.get(keyFn(row)) || []).push(row))
  return Array.from(group.values())
}

module.exports = {
  omit,
  mapTo,
  mapToMany,
  indentity: value => value,
  prop: name => item => item[name]
}
