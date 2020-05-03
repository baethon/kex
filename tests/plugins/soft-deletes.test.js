const test = require('ava')
const sinon = require('sinon')
const setupDb = require('../setup-db')
const { equalQueries } = require('../assertions')
const { createKex } = require('../utils')

setupDb()

test.serial.before(t => {
  t.context.User = createKex(t).createModel('User', {
    softDeletes: true
  })

  sinon.useFakeTimers({ now: new Date() })
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

test('trashing models', t => {
  const { knex, User } = t.context

  const expected = knex.table('users')
    .where('id', 1)
    .whereNull('deleted_at')
    .update({ deleted_at: new Date() })

  const actual = User.query()
    .where('id', 1)
    .delete()

  equalQueries(t, expected, actual)
})

test('trashing models | pass the returning cols (only `pg` DB_CLIENT)', t => {
  if (process.env.DB_CLIENT !== 'pg') {
    return t.pass()
  }

  const { knex, User } = t.context

  const expected = knex.table('users')
    .where('id', 1)
    .whereNull('deleted_at')
    .returning('id')
    .update({ deleted_at: new Date() })

  const actual = User.query()
    .where('id', 1)
    .delete('id')

  equalQueries(t, expected, actual)
})

test('trashing models | custom column name', t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User', {
    softDeletes: {
      columnName: 'deletedAt'
    }
  })

  const expected = knex.table('users')
    .where('id', 1)
    .whereNull('deletedAt')
    .update({ deletedAt: new Date() })

  const actual = User.query()
    .where('id', 1)
    .delete()

  equalQueries(t, expected, actual)
})

test('deleting models', t => {
  const { knex, User } = t.context

  const expected = knex.table('users')
    .where('id', 1)
    .whereNull('deleted_at')
    .delete()

  const actual = User.query()
    .where('id', 1)
    .delete({ trash: false })

  equalQueries(t, expected, actual)
})

test('deleting models | pass the returning cols (only `pg` DB_CLIENT)', t => {
  if (process.env.DB_CLIENT !== 'pg') {
    return t.pass()
  }

  const { knex, User } = t.context

  const expected = knex.table('users')
    .where('id', 1)
    .whereNull('deleted_at')
    .delete('id')

  const actual = User.query()
    .where('id', 1)
    .delete('id', { trash: false })

  equalQueries(t, expected, actual)
})

test.todo('restoring models')
