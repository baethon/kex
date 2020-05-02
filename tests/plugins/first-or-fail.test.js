const test = require('ava')
const setupDb = require('../setup-db')
const { createKex } = require('../utils')
const { ModelNotFound } = require('../../src/errors')

setupDb()

test('fetch row', async t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User', {
    primaryKey: 'username'
  })

  const expected = await knex.table('users')
    .where('username', 'jon')
    .first()

  const actual = await User.query()
    .where('username', 'jon')
    .firstOrFail()

  t.deepEqual(actual, expected)
})

test('fetch row | only selected columns', async t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User', {
    primaryKey: 'username'
  })

  const expected = await knex.table('users')
    .where('username', 'jon')
    .first(['username'])

  const actual = await User.query()
    .where('username', 'jon')
    .firstOrFail(['username'])

  t.deepEqual(actual, expected)
})

test('fail when model is not found', async t => {
  const User = createKex(t).createModel('User', {
    primaryKey: 'username'
  })

  await t.throwsAsync(
    () => User.query().where('username', 'rob').firstOrFail(),
    {
      instanceOf: ModelNotFound
    }
  )
})
