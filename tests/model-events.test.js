const test = require('ava')
const sinon = require('sinon')
const setupDb = require('./setup-db')
const { createKex } = require('./utils')

setupDb()

test.beforeEach(t => {
  const kex = createKex(t)
  t.context.User = kex.createModel('User')
})

test('events passing to query builder', t => {
  const { User } = t.context
  const spy = sinon.spy(User.events, 'clone')

  User.events.on('fetched', sinon.stub())

  const queryEvents = User.query().events

  t.deepEqual(User.events, queryEvents)
  t.false(User.events === queryEvents)
  t.true(spy.calledOnce)
})
