const test = require('ava')
const setupDb = require('./setup-db')
const { equalQueries } = require('./assertions')

setupDb()

test.serial.beforeEach(t => {
  const { kex } = t.context
  t.context.User = kex.createModel('User')
})

test('creates basic query object', t => {
  const { User, knex } = t.context
  equalQueries(t, knex('users'), User.query())
})

test('allows to pass custom table name', t => {
  const { knex, kex } = t.context
  const User = kex.createModel('User_2', {
    tableName: 'foos'
  })

  equalQueries(t, knex('foos'), User.query())
})
