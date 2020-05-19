const test = require('ava')
const setupDb = require('../setup-db')
const { createKex } = require('../utils')
const { HasMany } = require('../../')
const macros = require('./has-any.macro')

setupDb()

test.serial.before(async t => {
  const kex = createKex(t)
  const Message = kex.createModel('Message', {
    softDeletes: true,
    scopes: {
      fromUser: (qb, user) => {
        qb.where('user_id', user.id)
      },

      toUser: (qb, user) => {
        qb.where('to_user', user.id)
      }
    }
  })
  const User = kex.createModel('User')
  const users = {
    jon: await User.query().where('username', 'jon').firstOrFail(),
    sansa: await User.query().where('username', 'sansa').firstOrFail()
  }

  Object.assign(t.context, { Message, User, users })
})

const macro = macros.createDataLoaderMacro(HasMany)

test.serial('fetch messages', macro, {
  expectedFn: (Message, users) => Promise.all([
    Message.query().fromUser(users.jon),
    Message.query().fromUser(users.sansa)
  ])
})

test.serial('fetch messages | custom foreing key', macro, {
  expectedFn: (Message, users) => Promise.all([
    Message.query().toUser(users.jon),
    Message.query().toUser(users.sansa)
  ]),
  foreignKey: 'to_user'
})

test.serial('fetch messages | custom keys', macro, {
  expectedFn: (Message, users) => Promise.all([
    Message.query().fromUser(users.jon),
    Message.query().fromUser(users.sansa)
  ]),
  foreignKey: 'from_username',
  localKey: 'username'
})

test.serial('fetch messages | custom scope', macro, {
  expectedFn: (Message, users) => Promise.all([
    Message.query().fromUser(users.jon).onlyTrashed(),
    Message.query().fromUser(users.sansa).onlyTrashed()
  ]),
  scope: qb => qb.onlyTrashed()
})

const queryForSingleMacro = macros.createQueryForSingleMacro(HasMany)

test('query for single', queryForSingleMacro, {
  expectedFn: (Message, jon) => Message.query().fromUser(jon)
})

test('query for single | custom foreign key', queryForSingleMacro, {
  expectedFn: (Message, jon) => Message.query().toUser(jon),
  foreignKey: 'to_user'
})

test('query for single | custom keys', queryForSingleMacro, {
  expectedFn: (Message, jon) => Message.query().fromUser(jon),
  foreignKey: 'from_username',
  localKey: 'username'
})
