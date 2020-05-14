const test = require('ava')
const sinon = require('sinon')
const setupDb = require('./setup-db')
const { createKex } = require('./utils')
const { compareDbResults } = require('./assertions')
const { FetchingEvent, FetchedEvent } = require('../src/events')

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

test('fetched/fetching', async t => {
  const { User, knex } = t.context

  const fetching = sinon.stub()
  const fetched = sinon.stub()

  User.events.on('fetching', fetching)
  User.events.on('fetched', fetched)

  const expected = await knex.table('users')
  const query = User.query()
  const actual = await query

  t.true(fetching.calledWith(new FetchingEvent(query)))
  t.true(fetched.calledWith(new FetchedEvent(expected)))
  compareDbResults(t, expected, actual)
})

test('fetched/fetching | cancel fetching event', async t => {
  const { User } = t.context

  const fetched = sinon.stub()

  User.events.on('fetching', event => {
    event.cancel()
  })
  User.events.on('fetched', fetched)

  const actual = await User.query()

  t.false(fetched.called)
  t.is(actual, undefined)
})

test('fetched/fetching | modify end results', async t => {
  const { User } = t.context

  User.events.on('fetched', event => {
    event.results = 'foo'
  })

  const actual = await User.query()

  t.is(actual, 'foo')
})
