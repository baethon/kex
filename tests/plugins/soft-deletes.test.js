const test = require('ava')
const setupDb = require('../setup-db')
const { equalQueries } = require('../assertions')
const { createKex } = require('../utils')

setupDb()

test.serial.before(t => {
  t.context.User = createKex(t).createModel('User', {
    softDeletes: true
  })
})

test('don\'t alter the model when disabled', t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User')

  equalQueries(t, knex.table('users'), User.query())
})

test('add global scope', t => {
  const { knex, User } = t.context

  const expected = knex.table('users')
    .whereNull('deleted_at')

  equalQueries(t, expected, User.query())
})

test('add global scope | custom column name', t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User', {
    softDeletes: {
      columnName: 'deletedAt'
    }
  })

  const expected = knex.table('users')
    .whereNull('deletedAt')

  equalQueries(t, expected, User.query())
})

test('include trashed models', t => {
  const { knex, User } = t.context

  const expected = knex.table('users')

  equalQueries(t, expected, User.query().withTrashed())
})

test('select only trashed models', t => {
  const { knex, User } = t.context

  const expected = knex.table('users')
    .whereNotNull('deleted_at')

  equalQueries(t, expected, User.query().onlyTrashed())
})

test('select only trashed models | custom column name', t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User', {
    softDeletes: {
      columnName: 'deletedAt'
    }
  })

  const expected = knex.table('users')
    .whereNotNull('deletedAt')

  equalQueries(t, expected, User.query().onlyTrashed())
})
