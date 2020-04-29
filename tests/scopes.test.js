const test = require('ava')
const setupDb = require('./setup-db')
const { equalQueries } = require('./assertions')
const { createKex } = require('./utils')

setupDb()

const scopes = {
  activeUser: qb => {
    qb.where('role', 'User')
      .where('active', true)
  },
  allowedAge: (qb, age) => {
    qb.where('age', '>=', age)
  }
}

const createUsersModel = t => createKex(t).createModel('User', {
  scopes
})

test.beforeEach(t => {
  const User = createUsersModel(t)
  t.context.User = User
})

test('single scope', t => {
  const { knex, User } = t.context

  const expected = knex('users')
    .where(scopes.activeUser)
  const actual = User.query()
    .activeUser()

  equalQueries(t, expected, actual)
})

test('passing args to scope', t => {
  const { knex, User } = t.context

  const expected = knex('users')
    .where(qb => scopes.allowedAge(qb, 18))
  const actual = User.query()
    .allowedAge(18)

  equalQueries(t, expected, actual)
})

test('combine scopes', t => {
  const { knex, User } = t.context

  const expected = knex('users')
    .where(scopes.activeUser)
    .where(qb => scopes.allowedAge(qb, 18))
  const actual = User.query()
    .activeUser()
    .allowedAge(18)

  equalQueries(t, expected, actual)
})

test('nested scopes', t => {
  const { knex, User } = t.context

  const expected = knex('users')
    .where(scopes.activeUser)
    .orWhere(qb => qb.where(qb => scopes.allowedAge(qb, 18)))
  const actual = User.query()
    .activeUser()
    .orWhere(qb => qb.allowedAge(18))

  equalQueries(t, expected, actual)
})

test('global scopes', t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User', {
    globalScopes: {
      active: scopes.activeUser
    }
  })

  const expected = knex('users')
    .where(scopes.activeUser)

  equalQueries(t, expected, User.query())
})

test('global scopes | combine with other filters', t => {
  const { knex } = t.context
  const User = createKex(t).createModel('User', {
    globalScopes: {
      active: scopes.activeUser
    }
  })

  const expected = knex('users')
    .where('age', '>=', 18)
    .where(scopes.activeUser)
  const actual = User.query()
    .where('age', '>=', 18)

  equalQueries(t, expected, actual)
})

test.todo('global scopes | ignore selected')
test.todo('global scopes | disable on update')
test.todo('global scopes | disable on insert')
