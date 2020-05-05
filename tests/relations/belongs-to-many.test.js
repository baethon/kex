const test = require('ava')
const sinon = require('sinon')
const { BelongsToMany } = require('../../src/relations')
const setupDb = require('../setup-db')
const { createKex } = require('../utils')

setupDb()

const buildTagsJoinQuery = (Tag, table) => Tag.query()
  .join(`${table} AS pivot`, 'pivot.tag_id', 'tags.id')
  .select('tags.*')

test.serial.before(async t => {
  const kex = createKex(t)
  const User = kex.createModel('User')
  const Tag = kex.createModel('Tag')

  const users = await User.query()
    .then(users => users.reduce(
      (carry, user) => ({
        ...carry,
        [user.username]: user
      }),
      {}
    ))

  Object.assign(t.context, { kex, users, Tag })
})

const fetchUsersTagsMacro = async (t, options) => {
  const { kex, users, Tag } = t.context
  const { expectedFn, ...relationOptions } = options
  const relation = new BelongsToMany('Tag', relationOptions)

  const spy = sinon.spy(Tag, 'query')
  const dataLoader = relation.createDataLoader('User', kex)

  const actual = await Promise
    .all([
      dataLoader(users.jon),
      dataLoader(users.sansa)
    ])
    .then(([jon, sansa]) => ({ jon, sansa }))

  spy.restore()

  const expected = await expectedFn(Tag, users)
    .then(([jon, sansa]) => ({ jon, sansa }))

  t.true(spy.calledOnce)
  t.deepEqual(expected, actual)
}

test.serial('fetch users tags', fetchUsersTagsMacro, {
  expectedFn: (Tag, users) => Promise.all([
    buildTagsJoinQuery(Tag, 'tag_user')
      .where('pivot.user_id', users.jon.id),
    buildTagsJoinQuery(Tag, 'tag_user')
      .where('pivot.user_id', users.sansa.id)
  ])
})
test.serial('fetch users tags | custom table name', fetchUsersTagsMacro, {
  expectedFn: (Tag, users) => Promise.all([
    buildTagsJoinQuery(Tag, 'user_tag')
      .where('pivot.user_id', users.jon.id),
    buildTagsJoinQuery(Tag, 'user_tag')
      .where('pivot.user_id', users.sansa.id)
  ]),
  table: 'user_tag'
})
