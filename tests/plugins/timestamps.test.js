const test = require('ava')
const sinon = require('sinon')
const setupDb = require('../setup-db')
const { equalQueries } = require('../assertions')
const { createKex } = require('../utils')

setupDb()

test.before(() => {
  sinon.useFakeTimers({ now: new Date() })
})

test('disabled timestamps', t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User')

  equalQueries(t, knex.from('users').insert({ foo: 1 }), User.insert({ foo: 1 }))
  equalQueries(t, knex.from('users').update({ foo: 1 }), User.query().update({ foo: 1 }))
})

test('insert | default columns', async t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User', {
    timestamps: true
  })

  const expected = knex.table('users').insert({
    foo: 1,
    updated_at: new Date(),
    created_at: new Date()
  })

  equalQueries(t, expected, User.insert({ foo: 1 }))
})

test('insert | list of items', async t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User', {
    timestamps: true
  })

  const data = [
    { foo: 1 },
    { foo: 2 }
  ]

  const expected = knex.table('users').insert(data.map(item => ({
    ...item,
    updated_at: new Date(),
    created_at: new Date()
  })))

  equalQueries(t, expected, User.insert(data))
})

test('insert | custom column name', async t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User', {
    timestamps: { createdAtColumn: 'createdAt', updatedAtColumn: 'updatedAt' }
  })

  const expected = knex.table('users').insert({
    foo: 1,
    updatedAt: new Date(),
    createdAt: new Date()
  })

  equalQueries(t, expected, User.insert({ foo: 1 }))
})

test('update | default columns', async t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User', {
    timestamps: true
  })

  const expected = knex.table('users').update({
    foo: 1,
    updated_at: new Date()
  })

  equalQueries(t, expected, User.query().update({ foo: 1 }))
})

test('update | custom column name', async t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User', {
    timestamps: { createdAtColumn: 'createdAt', updatedAtColumn: 'updatedAt' }
  })

  const expected = knex.table('users').update({
    foo: 1,
    updatedAt: new Date()
  })

  equalQueries(t, expected, User.query().update({ foo: 1 }))
})
