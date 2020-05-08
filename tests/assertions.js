const unwrapData = value => JSON.parse(JSON.stringify(value))

/**
 * Compare database results
 *
 * Mysql client wraps rows in a data object which fails to pass the equality check.
 * Since we focus on data, this method removes the wrapping objects and compares
 * plaing JS arrays/objects
 *
 * @param {Object} t
 * @param {Object|Object[]} expected
 * @param {Object|Object[]} actual
 */
const compareDbResults = (t, expected, actual) => {
  t.deepEqual(unwrapData(actual), unwrapData(expected))
}

const equalQueries = (t, expectedQuery, actualQuery) => {
  const expectedSql = expectedQuery.toSQL()
  const actualSql = actualQuery.toSQL()

  t.is(expectedSql.sql, actualSql.sql)
  t.deepEqual(expectedSql.bindings, actualSql.bindings)
}

module.exports = { equalQueries, compareDbResults }
