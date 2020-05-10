const test = require('ava')
const setupDb = require('../setup-db')
const { equalQueries } = require('../assertions')
const { createKex } = require('../utils')
const { ModelNotFound } = require('../../src/errors')

setupDb()

test('find() | default options', t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User')

  const expected = knex.table('users')
    .where('id', 1)
    .first()

  equalQueries(t, expected, User.find(1))
})

test('find() | custom primary key', t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User', {
    primaryKey: 'username'
  })

  const expected = knex.table('users')
    .where('username', 1)
    .first()

  equalQueries(t, expected, User.find(1))
})

test('find() | ignore global scopes', t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User', {
    globalScopes: {
      active: qb => qb.where('active', true),
      other: qb => qb.where('other', true)
    }
  })

  const expected = knex.table('users')
    .where('id', 1)
    .first()

  equalQueries(t, expected, User.find(1))
})

test('findOrFail() | fetch row', async t => {
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

test('findOrFail() | ignore global scopes', async t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User', {
    primaryKey: 'username',
    globalScopes: {
      active: qb => qb.where('active', true),
      other: qb => qb.where('other', true)
    }
  })

  const expected = await knex.table('users')
    .where('username', 'jon')
    .first()

  const actual = await User.findOrFail('jon')

  t.deepEqual(actual, expected)
})
