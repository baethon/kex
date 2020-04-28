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

test.todo('global scopes')
test.todo('global scopes | ignore selected')
