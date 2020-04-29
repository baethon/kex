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

module.exports = { omit }
