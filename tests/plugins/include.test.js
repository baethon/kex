const test = require('ava')
const sinon = require('sinon')
const setupDb = require('../setup-db')
const { createKex } = require('../utils')
const { noop } = require('../../src/utils')
const { HasMany, BelongsToMany, BelongsTo } = require('../../src/relations')

setupDb()

test.serial.before(async t => {
  const kex = createKex(t)

  const User = kex.createModel('User', {
    relations: {
      tags: new BelongsToMany('Tag'),
      messages: new HasMany('Message'),
      receivedMessages: new HasMany('Message', { foreignKey: 'to_user' })
    }
  })

  const Message = kex.createModel('Message', {
    softDeletes: true,
    relations: {
      user: new BelongsTo('User'),
      tags: new BelongsToMany('Tag')
    },
    scopes: {
      fromUser (qb, user) {
        qb.where('user_id', user.id)
      },
      toUser (qb, user) {
        qb.where('to_user', user.id)
      }
    }
  })

  const Tag = kex.createModel('Tag', {
    relations: {
      users: new BelongsToMany('User'),
      messages: new BelongsToMany('Message')
    }
  })

  Object.assign(t.context, { Tag, User, Message })
})

test.serial('include single relation', async t => {
  const { User, Message } = t.context
  const expected = await User.query()
    .then(users => {
      const promiseMap = users.map(item => Message.query()
        .fromUser(item)
        .then(messages => ({
          ...item,
          messages
        }))
      )
      return Promise.all(promiseMap)
    })

  t.plan(3)

  const spy = sinon.spy(Message, 'query')
  const actual = await User.query()
    .include({
      messages: qb => {
        t.true(qb instanceof Message.QueryBuilder)
      }
    })

  spy.restore()

  t.true(spy.calledOnce)
  t.deepEqual(expected, actual)
})

test('include single relation | single row', async t => {
  const { User, Message } = t.context
  const expected = await User.query()
    .first()
    .then(async user => {
      const messages = await Message.query()
        .fromUser(user)

      return ({
        ...user,
        messages
      })
    })

  const actual = await User.query()
    .include({
      messages: noop
    })
    .first()

  t.deepEqual(expected, actual)
})

test('include single relation | modify related query', async t => {
  const { User, Message } = t.context
  const expected = await User.query()
    .then(users => {
      const promiseMap = users.map(item => Message.query()
        .fromUser(item)
        .withTrashed()
        .then(messages => ({
          ...item,
          messages
        }))
      )
      return Promise.all(promiseMap)
    })

  const actual = await User.query()
    .include({
      messages: qb => qb.withTrashed()
    })

  t.deepEqual(expected, actual)
})

test.serial('include single relation | include many relations', async t => {
  const { User, Message } = t.context
  const expected = await User.query()
    .then(users => {
      const promiseMap = users.map(item => Message.query()
        .fromUser(item)
        .then(messages => ({
          ...item,
          messages
        }))
      )
      return Promise.all(promiseMap)
    })
    .then(users => {
      const promiseMap = users.map(item => Message.query()
        .toUser(item)
        .then(receivedMessages => ({
          ...item,
          receivedMessages
        }))
      )
      return Promise.all(promiseMap)
    })

  const spy = sinon.spy(Message, 'query')
  const actual = await User.query()
    .include({
      messages: noop,
      receivedMessages: noop
    })

  spy.restore()

  t.true(spy.calledTwice)
  t.deepEqual(expected, actual)
})

test.serial('include single relation | nested includes', async t => {
  const { User, Message } = t.context
  const expected = await User.query()
    .then(users => {
      const promiseMap = users.map(user => Message.query()
        .fromUser(user)
        .then(messages => ({
          ...user,
          messages: messages.map(item => ({
            ...item,
            user
          }))
        }))
      )
      return Promise.all(promiseMap)
    })

  t.plan(5)

  const userQuerySpy = sinon.spy(User, 'query')
  const messageQuerySpy = sinon.spy(Message, 'query')

  const actual = await User.query()
    .include({
      messages: qb => {
        t.true(qb instanceof Message.QueryBuilder)

        qb.include({
          user: qb => {
            t.true(qb instanceof User.QueryBuilder)
          }
        })
      }
    })

  userQuerySpy.restore()
  messageQuerySpy.restore()

  t.true(userQuerySpy.calledTwice)
  t.true(messageQuerySpy.calledOnce)
  t.deepEqual(expected, actual)
})

const includeCompareMacro = async (t, options) => {
  const { expectedFn, includes } = options
  const { User } = t.context

  const actualQuery = User.query()

  includes.forEach(include => actualQuery.include(include))

  const expected = await expectedFn(User)
  const actual = await actualQuery

  t.deepEqual(expected, actual)
}

test('include as a string', includeCompareMacro, {
  expectedFn: User => User.query().include({ messages: noop }),
  includes: [
    'messages'
  ]
})

test('nested includes', includeCompareMacro, {
  expectedFn: User => User.query().include({
    messages: qb => {
      qb.include({ tags: noop })
    }
  }),
  includes: [
    ['messages', 'messages.tags']
  ]
})

test('nested includes | without the root relation', includeCompareMacro, {
  expectedFn: User => User.query().include({
    messages: qb => {
      qb.include({ tags: noop })
    }
  }),
  includes: [
    ['messages.tags']
  ]
})

test('mixed nested includes', includeCompareMacro, {
  expectedFn: User => User.query().include({
    messages: qb => {
      qb.withTrashed()
      qb.include({ tags: noop })
    }
  }),
  includes: [
    { messages: qb => qb.withTrashed() },
    'messages.tags'
  ]
})
