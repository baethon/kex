const test = require('ava')
const sinon = require('sinon')
const { BelongsToMany } = require('../../src/relations')
const setupDb = require('../setup-db')
const { createKex } = require('../utils')
const { compareDbResults } = require('../assertions')

setupDb()

const buildTagsJoinQuery = (Tag, table, pivotKey = 'tag_id', primaryKey = 'id') => Tag.query()
  .join(`${table} AS pivot`, `pivot.${pivotKey}`, `tags.${primaryKey}`)
  .select('tags.*')

test.serial.before(async t => {
  const kex = createKex(t)
  const User = kex.createModel('User')
  const Tag = kex.createModel('Tag')

  Object.assign(t.context, { Tag, User })
})

const fetchUsersTagsMacro = async (t, options) => {
  const { Tag, User } = t.context
  const { expectedFn, ...relationOptions } = options
  const relation = new BelongsToMany('Tag', relationOptions)

  const spy = sinon.spy(Tag, 'query')
  const dataLoader = relation.createDataLoader(User, qb => qb.orderBy('tags.id', 'asc'))

  const users = await User.query()
    .then(users => users.reduce(
      (carry, user) => ({
        ...carry,
        [user.username]: user
      }),
      {}
    ))

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
  compareDbResults(t, expected, actual)
}

/**
 * This is a simplified version of the `fetchUsersTagsMacro`.
 *
 * It's meant to check if the reverse of the same relation works
 * without any issues.
 */
const fetchTagsUsersMacro = async (t, options) => {
  const { User, Tag } = t.context
  const relation = new BelongsToMany('User', options)

  const dataLoader = relation.createDataLoader(Tag)
  const tags = await Tag.query().whereIn('title', ['common-1', 'common-2'])
  const users = await User.query()

  const spy = sinon.spy(User, 'query')
  const actual = await Promise
    .all([
      dataLoader(tags[0]),
      dataLoader(tags[1])
    ])

  spy.restore()

  const expected = [users, users]

  t.true(spy.calledOnce)
  compareDbResults(t, expected, actual)
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

test.serial('fetch user tags | custom keys', fetchUsersTagsMacro, {
  expectedFn: (Tag, users) => Promise.all([
    buildTagsJoinQuery(Tag, 'tag_user_using_strings', 'tag', 'title')
      .where('pivot.username', users.jon.username),
    buildTagsJoinQuery(Tag, 'tag_user_using_strings', 'tag', 'title')
      .where('pivot.username', users.sansa.username)
  ]),
  table: 'tag_user_using_strings',
  foreignPivotKey: 'username',
  relatedPivotKey: 'tag',
  parentKey: 'username',
  relatedKey: 'title'
})

test.serial('fetch tags users', fetchTagsUsersMacro, {})
test.serial('fetch tags users | custom table', fetchTagsUsersMacro, {
  table: 'user_tag'
})
