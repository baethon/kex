const test = require('ava')
const sinon = require('sinon')
const setupDb = require('./setup-db')
const { createKex } = require('./utils')
const modelUtils = require('../src/model')

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

  const modelOptions = {
    hello: 'there!'
  }

  const User = kex.createModel('User', modelOptions)

  t.true(firstPlugin.calledWith(sinon.match.same(User), modelOptions))
  t.true(secondPlugin.calledWith(sinon.match.same(User), modelOptions))
})

test.serial('merge default options with model options', t => {
  const { knex } = t.context
  const kex = createKex(t, {
    modelDefaults: {
      hello: 'there!',
      softDeletes: false,
      nested: { enabled: true, something: 'else' }
    }
  })

  const stub = sinon.stub(modelUtils, 'createModel').returns({})

  kex.createModel('User', {
    softDeletes: true,
    nested: { enabled: false }
  })

  modelUtils.createModel.restore()

  t.true(stub.calledWith(knex, 'User', {
    hello: 'there!',
    softDeletes: true,
    nested: { enabled: false }
  }))
})

test.serial('merge default options with model options | ignore selected options', t => {
  const { knex } = t.context
  const kex = createKex(t, {
    modelDefaults: {
      tableName: 'foo',
      primaryKey: 'foo'
    }
  })

  const stub = sinon.stub(modelUtils, 'createModel').returns({})

  kex.createModel('User')

  modelUtils.createModel.restore()

  t.true(stub.calledWith(knex, 'User', {}))
})
