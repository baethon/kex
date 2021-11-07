const test = require('ava')
const setupDb = require('./setup-db')
const BaseQueryBuilder = require('knex/lib/query/querybuilder')
const { createKex } = require('./utils')

setupDb()

test.serial.before(t => {
  const kex = createKex(t)
  t.context.User = kex.createModel('User')
})

test('whereExists()', t => {
  const { User } = t.context

  t.plan(2)

  User.query()
    .whereExists(function () {
      t.true(this instanceof BaseQueryBuilder)
      t.false(this instanceof User.QueryBuilder)
    })
    .toSQL()
})

const whereMacro = (t, methodName) => {
  const { User } = t.context

  t.plan(2)

  const query = User.query()

  query[methodName](function (qb) {
    t.true(this instanceof User.QueryBuilder)
    t.true(qb instanceof User.QueryBuilder)
  })
    .toSQL()
}

test('where() | callback', whereMacro, 'where')
test('orWhere() | callback', whereMacro, 'orWhere')
test('andWhere() | callback', whereMacro, 'andWhere')

test('where() | nested where()', t => {
  const { User } = t.context

  t.plan(2)

  const query = User.query()

  query.where((qb) => {
    qb.where(function (innerQb) {
      t.true(this instanceof User.QueryBuilder)
      t.true(innerQb instanceof User.QueryBuilder)
    })
  })
    .toSQL()
})
