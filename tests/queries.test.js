const test = require('ava')
const setupDb = require('./setup-db')
const { equalQueries } = require('./assertions')
const { createKex } = require('./utils')

setupDb()

test('creates basic query object', t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User')
  equalQueries(t, knex('users'), User.query())
})

test('allows to pass custom table name', t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User', {
    tableName: 'foos'
  })

  equalQueries(t, knex('foos'), User.query())
})
