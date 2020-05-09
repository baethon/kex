const test = require('ava')
const sinon = require('sinon')
const setupDb = require('./setup-db')
const { createKex } = require('./utils')

setupDb()

test('pass created model to plugins handler', t => {
  const firstPlugin = sinon.stub()
  const secondPlugin = sinon.stub()

  const kex = createKex(t, {
    plugins: [
      firstPlugin,
      secondPlugin
    ]
  })

  const User = kex.createModel('User')

  t.true(firstPlugin.calledWith(sinon.match.same(User)))
  t.true(secondPlugin.calledWith(sinon.match.same(User)))
})

test('merge default options with model options', t => {
  const kex = createKex(t, {
    modelDefaults: {
      hello: 'there!',
      softDeletes: false,
      nested: { enabled: true, something: 'else' }
    }
  })

  const User = kex.createModel('User', {
    softDeletes: true,
    nested: { enabled: false }
  })

  t.deepEqual(User.options, {
    hello: 'there!',
    softDeletes: true,
    nested: { enabled: false }
  })
})

test('merge default options with model options | ignore selected options', t => {
  const kex = createKex(t, {
    modelDefaults: {
      tableName: 'foo',
      primaryKey: 'foo'
    }
  })

  const User = kex.createModel('User')

  t.deepEqual(User.options, {})
})

test('resolve knex client', t => {
  const { knex } = t.context
  const kex = createKex(t)

  t.is(knex.client, kex.getKnexClient())
})

test('resolve knex client | custom resolver', t => {
  const client = Symbol('fake client')
  const kex = createKex(t, {
    knexClientResolver: () => client
  })

  t.is(client, kex.getKnexClient())
})
