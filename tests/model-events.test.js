const test = require('ava')
const sinon = require('sinon')
const setupDb = require('./setup-db')
const { createKex } = require('./utils')
const { compareDbResults } = require('./assertions')
const events = require('../src/events')

setupDb()

const emitted = event => {
  event.markEmitted()
  return event
}

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
  const actual = await User.query()

  t.true(fetching.calledWith(emitted(new events.FetchingEvent())))
  t.true(fetched.calledWith(emitted(new events.FetchedEvent(expected))))
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

test.serial('updating/updated', async t => {
  const { User, knex } = t.context

  const updating = sinon.stub()
  const updated = sinon.stub()
  const [userId] = await knex.table('users')
    .returning('id')
    .insert({
      username: 'arya',
      first_name: 'Arya',
      last_name: 'Stark',
      active: true
    })

  User.events.on('updating', updating)
  User.events.on('updated', updated)

  const data = { active: false }
  const query = User.query()
    .where('id', userId)
    .update(data)

  await query

  const check = await User.find(userId)

  await User.find(userId)
    .delete()

  t.true(updating.calledWith(emitted(new events.UpdatingEvent(data))))
  t.true(updated.calledWith(emitted(new events.UpdatedEvent(
    sinon.match.any,
    data
  ))))

  t.falsy(check.active)
})

test.serial('updating/updated | alter update data', async t => {
  const { User, knex } = t.context

  const [userId] = await knex.table('users')
    .returning('id')
    .insert({
      username: 'arya',
      first_name: 'Arya',
      last_name: 'Stark',
      active: true
    })

  User.events.on('updating', (event) => {
    event.values = {
      ...event.values,
      last_name: 'No name'
    }
  })

  const data = { active: false }
  await User.query()
    .where('id', userId)
    .update(data)

  const check = await User.find(userId)

  await User.find(userId)
    .delete()

  t.falsy(check.active)
  t.is(check.last_name, 'No name')
})

test.serial('updating/updated | cancel update', async t => {
  const { User, knex } = t.context

  const updated = sinon.stub()
  const [userId] = await knex.table('users')
    .returning('id')
    .insert({
      username: 'arya',
      first_name: 'Arya',
      last_name: 'Stark',
      active: true
    })

  User.events.on('updating', (event) => {
    event.cancel()
  })
  User.events.on('updated', updated)

  const data = { active: false }
  const query = User.query()
    .where('id', userId)
    .update(data)

  await query

  const check = await User.find(userId)

  await User.find(userId)
    .delete()

  t.false(updated.called)

  t.truthy(check.active)
})

test.serial('deleting/deleted', async t => {
  const { User, knex } = t.context

  const deleting = sinon.stub()
  const deleted = sinon.stub()
  const [userId] = await knex.table('users')
    .returning('id')
    .insert({
      username: 'arya',
      first_name: 'Arya',
      last_name: 'Stark',
      active: true
    })

  User.events.on('deleting', deleting)
  User.events.on('deleted', deleted)

  const query = User.query()
    .where('id', userId)
    .delete()

  await query

  const check = await User.find(userId)

  await knex.table('users')
    .where('id', userId)
    .delete()

  t.true(deleting.calledWith(emitted(new events.DeletingEvent())))
  t.true(deleted.calledWith(emitted(new events.DeletedEvent(sinon.match.any))))
  t.falsy(check)
})

test.serial('deleting/deleted | cancel event', async t => {
  const { User, knex } = t.context

  const deleted = sinon.stub()
  const [userId] = await knex.table('users')
    .returning('id')
    .insert({
      username: 'arya',
      first_name: 'Arya',
      last_name: 'Stark',
      active: true
    })

  User.events.on('deleting', (event) => {
    event.cancel()
  })
  User.events.on('deleted', deleted)

  await User.query()
    .where('id', userId)
    .delete()

  const check = await User.find(userId)

  await knex.table('users')
    .where('id', userId)
    .delete()

  t.false(deleted.called)
  t.truthy(check)
})

test.serial('inserting/inserted', async t => {
  const { User } = t.context

  const inserting = sinon.stub()
  const inserted = sinon.stub()
  const data = {
    username: 'arya',
    first_name: 'Arya',
    last_name: 'Stark',
    active: true
  }

  User.events.on('inserting', inserting)
  User.events.on('inserted', inserted)

  const [userId] = await User.returning('id')
    .insert(data)

  await User.findOrFail(userId)
  await User.find(userId)
    .delete()

  t.true(inserting.calledWith(emitted(new events.InsertingEvent(data, 'id'))))
  t.true(inserted.calledWith(emitted(new events.InsertedEvent(
    sinon.match.any,
    data
  ))))
})

test.serial('inserting/inserted | cancel inserting', async t => {
  const { User } = t.context

  const inserted = sinon.stub()
  const data = {
    username: 'arya',
    first_name: 'Arya',
    last_name: 'Stark',
    active: true
  }

  User.events.on('inserting', (event) => {
    event.cancel()
  })
  User.events.on('inserted', inserted)

  const [{ count: usersCount }] = await User.query().count()

  const result = await User.returning('id')
    .insert(data)

  const [{ count: checkCount }] = await User.query().count()

  t.false(inserted.called)
  t.is(checkCount, usersCount)
  t.falsy(result)
})

test.serial('inserting/inserted | modify data', async t => {
  const { User } = t.context

  const data = {
    username: 'arya',
    first_name: 'Arya',
    last_name: 'Stark',
    active: true
  }

  User.events.on('inserting', (event) => {
    event.values = {
      ...event.values,
      active: false
    }
  })

  const [userId] = await User.returning('id')
    .insert(data)

  const check = await User.findOrFail(userId)

  await User.find(userId)
    .delete()

  t.falsy(check.active)
})
