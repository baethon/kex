const test = require('ava')
const setupDb = require('../setup-db')
const { createKex } = require('../utils')
const { HasMany, BelongsToMany, BelongsTo } = require('../../src/relations')
const { compareDbResults } = require('../assertions')

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

  const Tag = kex.createModel('Tag')

  const jon = await User.where('username', 'jon')
    .firstOrFail()

  Object.assign(t.context, { Tag, User, Message, jon })
})

test('user relations | get tags', async t => {
  const { jon, Tag, User } = t.context

  const expected = await Tag.query()
    .select('tags.*')
    .join('user_tag', 'user_tag.tag_id', 'tags.id')
    .where('user_id', jon.id)
    .orderBy('tags.id', 'asc')

  const actual = await User.tags(jon.id)
    .orderBy('id', 'asc')

  compareDbResults(t, expected, actual)
})

test('user relations | get messages', async t => {
  const { jon, Message, User } = t.context

  const expected = await Message.query()
    .fromUser(jon)
  const actual = await User.messages(jon.id)

  t.deepEqual(actual, expected)
})

test('user relations | get received messages', async t => {
  const { jon, Message, User } = t.context

  const expected = await Message.query()
    .toUser(jon)
  const actual = await User.receivedMessages(jon.id)

  t.deepEqual(actual, expected)
})

test('message relations | get user', async t => {
  const { jon, Message } = t.context

  const message = await Message.query()
    .fromUser(jon)
    .first()

  const actual = await Message.user(message.user_id)

  t.deepEqual(actual, jon)
})
