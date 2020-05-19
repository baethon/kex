const test = require('ava')
const setupDb = require('../setup-db')
const { createKex } = require('../utils')
const { HasOne } = require('../../')
const macros = require('./has-any.macro')

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

  Object.assign(t.context, { Message, User, users })
})

const macro = macros.createDataLoaderMacro(HasOne)

test.serial('fetch message', macro, {
  expectedFn: (Message, users) => Promise.all([
    Message.query().fromUser(users.jon).first(),
    Message.query().fromUser(users.sansa).first()
  ])
})

test.serial('fetch message | custom foreign key', macro, {
  expectedFn: (Message, users) => Promise.all([
    Message.query().toUser(users.jon).first(),
    Message.query().toUser(users.sansa).first()
  ]),
  foreignKey: 'to_user'
})

test.serial('fetch message | custom keys', macro, {
  expectedFn: (Message, users) => Promise.all([
    Message.query().fromUser(users.jon).first(),
    Message.query().fromUser(users.sansa).first()
  ]),
  foreignKey: 'from_username',
  localKey: 'username'
})

test.serial('fetch message | custom scope', macro, {
  expectedFn: (Message, users) => Promise.all([
    Message.query().fromUser(users.jon).onlyTrashed().first(),
    null
  ]),
  scope: qb => qb.onlyTrashed()
})

const queryForSingleMacro = macros.createQueryForSingleMacro(HasOne)

test('query for single', queryForSingleMacro, {
  expectedFn: (Message, jon) => Message.query().fromUser(jon).first()
})

test('query for single | custom foreign key', queryForSingleMacro, {
  expectedFn: (Message, jon) => Message.query().toUser(jon).first(),
  foreignKey: 'to_user'
})

test('query for single | custom keys', queryForSingleMacro, {
  expectedFn: (Message, jon) => Message.query().fromUser(jon).first(),
  foreignKey: 'from_username',
  localKey: 'username'
})
