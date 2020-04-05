const equalQueries = (t, expectedQuery, actualQuery) => {
  const expectedSql = expectedQuery.toSQL()
  const actualSql = actualQuery.toSQL()

  t.is(expectedSql.sql, actualSql.sql)
  t.deepEqual(expectedSql.bindings, actualSql.bindings)
}

module.exports = { equalQueries }
