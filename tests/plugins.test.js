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

  const modelOptions = {
    hello: 'there!'
  }

  const User = kex.createModel('User', modelOptions)

  t.true(firstPlugin.calledWith(sinon.match.same(User), modelOptions))
  t.true(secondPlugin.calledWith(sinon.match.same(User), modelOptions))
})
