const test = require('ava')
const { BelongsTo } = require('../../src/relations')
const setupDb = require('../setup-db')
const { createKex } = require('../utils')

setupDb()

// 'Message #1'

const macro = async (t, options) => {
  const {
    expectedFn,
    foreignKey = undefined,
    otherKey = undefined,
    scope = undefined
  } = options

  const { kex, testMessage, User } = t.context

  const relation = new BelongsTo('User', foreignKey, otherKey)
  const dataLoader = relation.createDataLoader('Message', kex, scope)
  const expected = await expectedFn(User)
  const actual = await dataLoader(testMessage)

  t.deepEqual(expected, actual)
}

macro.title = (providedTitle, { foreignKey, otherKey, scope }) => {
  const v = (name, value) => value
    ? `${name}=${value}`
    : `${name}=`

  const chunks = [
    v('foreignKey', foreignKey),
    v('otherKey', otherKey),
    v('scope', scope)
  ]

  return chunks.join(', ')
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

  Object.assign(t.context, { kex, testMessage, User })
})

test(macro, {
  expectedFn: User => User.query().username('jon').firstOrFail()
})

test(macro, {
  expectedFn: User => User.query().username('sansa').firstOrFail(),
  foreignKey: 'to_user'
})

test(macro, {
  expectedFn: User => User.query().username('jon').firstOrFail(),
  foreignKey: 'from_username',
  otherKey: 'username'
})
