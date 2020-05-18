const test = require('ava')
const sinon = require('sinon')
const setupDb = require('./setup-db')
const { equalQueries } = require('./assertions')
const { createKex } = require('./utils')

setupDb()

test('creates basic query object', t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User')
  equalQueries(t, knex('users'), User.query())
})

test('allows to pass custom table name', t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User', {
    tableName: 'foos'
  })

  equalQueries(t, knex('foos'), User.query())
})

test('passing subqueries', t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User')
  const subquery = knex.table('tags').select('user_id')

  equalQueries(t, knex('users').whereIn('id', subquery), User.query().whereIn('id', subquery))
})

test('forbid using table()', t => {
  const User = createKex(t).createModel('User')

  t.throws(() => {
    User.query()
      .table('foo')
  })
})

test('events | add listener', async t => {
  const User = createKex(t).createModel('User')

  const listener = sinon.stub()

  await User.query()
    .on('fetching', listener)

  t.true(listener.calledOnce)
})

test('events | add knex native listener', async t => {
  const User = createKex(t).createModel('User')

  const listener = sinon.stub()

  await User.query()
    .on('query', listener, { native: true })

  t.true(listener.calledOnce)
})
