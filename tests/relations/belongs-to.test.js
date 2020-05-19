const test = require('ava')
const { BelongsTo } = require('../../src/relations')
const setupDb = require('../setup-db')
const { createKex } = require('../utils')

setupDb()

const macro = async (t, options) => {
  const {
    expectedFn,
    foreignKey = undefined,
    otherKey = undefined,
    scope = undefined
  } = options

  const { testMessage, User, Message } = t.context

  const relation = new BelongsTo('User', { foreignKey, otherKey })
  const dataLoader = relation.createDataLoader(Message, scope)
  const expected = await expectedFn(User)
  const actual = await dataLoader(testMessage)

  t.deepEqual(expected, actual)
}

test.serial.before(async t => {
  const kex = createKex(t)
  const Message = kex.createModel('Message')
  const User = kex.createModel('User', {
    scopes: {
      username: (qb, username) => {
        qb.where({ username })
      }
    }
  })

  const testMessage = await Message.query().where('text', 'Message #1').firstOrFail()

  Object.assign(t.context, { testMessage, User, Message })
})

test('fetch user | defaults', macro, {
  expectedFn: User => User.query().username('jon').firstOrFail()
})

test('fetch user | custom foreign key', macro, {
  expectedFn: User => User.query().username('sansa').firstOrFail(),
  foreignKey: 'to_user'
})

test('fetch user | custom keys', macro, {
  expectedFn: User => User.query().username('jon').firstOrFail(),
  foreignKey: 'from_username',
  otherKey: 'username'
})

const queryForSingleMacro = async (t, options) => {
  const {
    expectedFn,
    foreignKey = 'user_id',
    otherKey = undefined
  } = options

  const { testMessage, User, Message } = t.context
  const relation = new BelongsTo('User', { foreignKey, otherKey })
  const expected = await expectedFn(User)
  const actual = await relation.queryForSingle(Message, testMessage[foreignKey])

  t.deepEqual(actual, expected)
}

test('query for single | defaults', queryForSingleMacro, {
  expectedFn: User => User.query().username('jon').firstOrFail()
})

test('query for single | custom foreign key', queryForSingleMacro, {
  expectedFn: User => User.query().username('sansa').firstOrFail(),
  foreignKey: 'to_user'
})

test('query for single | custom keys', queryForSingleMacro, {
  expectedFn: User => User.query().username('jon').firstOrFail(),
  foreignKey: 'from_username',
  otherKey: 'username'
})
