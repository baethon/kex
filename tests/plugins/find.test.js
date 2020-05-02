const test = require('ava')
const setupDb = require('../setup-db')
const { equalQueries } = require('../assertions')
const { createKex } = require('../utils')
const { ModelNotFound } = require('../../src/errors')

setupDb()

test('build query | default options', t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User')

  const expected = knex.table('users')
    .where('id', 1)
    .first()

  equalQueries(t, expected, User.find(1))
})

test('build query | custom primary key', t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User', {
    primaryKey: 'username'
  })

  const expected = knex.table('users')
    .where('username', 1)
    .first()

  equalQueries(t, expected, User.find(1))
})

test('findOrFail | fetch row', async t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User', {
    primaryKey: 'username'
  })

  const expected = await knex.table('users')
    .where('username', 'jon')
    .first()

  const actual = await User.findOrFail('jon')

  t.deepEqual(actual, expected)
})

test('findOrFail | fail when model is not found', async t => {
  const User = createKex(t).createModel('User', {
    primaryKey: 'username'
  })

  await t.throwsAsync(
    () => User.findOrFail('rob'),
    {
      instanceOf: ModelNotFound
    }
  )
})
