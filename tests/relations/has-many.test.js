const test = require('ava')
const sinon = require('sinon')
const setupDb = require('../setup-db')
const { createKex } = require('../utils')
const { HasMany } = require('../../')

setupDb()

test.serial.before(async t => {
  const kex = createKex(t)
  const Message = kex.createModel('Message', {
    softDeletes: true,
    scopes: {
      fromUser: (qb, user) => {
        qb.where('user_id', user.id)
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

test('fetch related messages', async t => {
  const { kex, Message, users } = t.context

  const relation = new HasMany('Message')
  const dataLoader = relation.createDataLoader('User', kex)
  const expected = {
    jon: await Message.query().where('user_id', users.jon.id),
    sansa: await Message.query().where('user_id', users.sansa.id)
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
