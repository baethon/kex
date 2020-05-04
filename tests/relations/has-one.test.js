const test = require('ava')
const sinon = require('sinon')
const setupDb = require('../setup-db')
const { createKex } = require('../utils')
const { HasOne } = require('../../')

setupDb()

test.serial.before(async t => {
  const kex = createKex(t)
  const Message = kex.createModel('Message', {
    softDeletes: true,
    scopes: {
      fromUser (qb, user) {
        qb.where('user_id', user.id)
      },

      toUser (qb, user) {
        qb.where('to_user', user.id)
      }
    }
  })
  const User = kex.createModel('User')
  const users = {
    jon: await User.query().where('username', 'jon').firstOrFail(),
    sansa: await User.query().where('username', 'sansa').firstOrFail()
  }

  Object.assign(t.context, { kex, Message, User, users })
})

test.serial('fetch users sent message', async t => {
  const { kex, Message, users } = t.context

  const relation = new HasOne('Message')
  const dataLoader = relation.createDataLoader('User', kex)
  const expected = {
    jon: await Message.query().fromUser(users.jon).first(),
    sansa: await Message.query().fromUser(users.sansa).first()
  }

  const spy = sinon.spy(Message, 'query')
  const actual = await Promise
    .all([
      dataLoader(users.jon),
      dataLoader(users.sansa)
    ])
    .then(([jon, sansa]) => ({ jon, sansa }))

  spy.restore()

  t.deepEqual(actual, expected)
  t.true(spy.calledOnce)
})

test.serial('fetch users received message', async t => {
  const { kex, Message, users } = t.context

  const relation = new HasOne('Message', 'to_user')
  const dataLoader = relation.createDataLoader('User', kex)
  const expected = {
    jon: await Message.query().toUser(users.jon).first(),
    sansa: await Message.query().toUser(users.sansa).first()
  }

  const spy = sinon.spy(Message, 'query')
  const actual = await Promise
    .all([
      dataLoader(users.jon),
      dataLoader(users.sansa)
    ])
    .then(([jon, sansa]) => ({ jon, sansa }))

  spy.restore()

  t.deepEqual(actual, expected)
  t.true(spy.calledOnce)
})

test.serial('fetch users sent message | use different model key', async t => {
  const { kex, Message, users } = t.context

  const relation = new HasOne('Message', 'from_username', 'username')
  const dataLoader = relation.createDataLoader('User', kex)
  const expected = {
    jon: await Message.query().fromUser(users.jon).first(),
    sansa: await Message.query().fromUser(users.sansa).first()
  }

  const spy = sinon.spy(Message, 'query')
  const actual = await Promise
    .all([
      dataLoader(users.jon),
      dataLoader(users.sansa)
    ])
    .then(([jon, sansa]) => ({ jon, sansa }))

  spy.restore()

  t.deepEqual(actual, expected)
  t.true(spy.calledOnce)
})

test.serial('fetch users sent message | pass custom qb modifier', async t => {
  const { kex, Message, users } = t.context

  t.plan(3)

  const relation = new HasOne('Message')
  const dataLoader = relation.createDataLoader('User', kex, qb => {
    t.true(qb instanceof Message.QueryBuilder)

    qb.onlyTrashed()
  })

  const expected = {
    jon: await Message.query().fromUser(users.jon).onlyTrashed().first(),
    sansa: null
  }

  const spy = sinon.spy(Message, 'query')
  const actual = await Promise
    .all([
      dataLoader(users.jon),
      dataLoader(users.sansa)
    ])
    .then(([jon, sansa]) => ({ jon, sansa }))

  spy.restore()

  t.deepEqual(actual, expected)
  t.true(spy.calledOnce)
})
