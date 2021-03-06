const sinon = require('sinon')

const createDataLoaderMacro = Relation => async (t, options) => {
  const {
    expectedFn,
    foreignKey = undefined,
    localKey = undefined,
    scope = undefined
  } = options

  const { Message, users, User } = t.context

  const relation = new Relation('Message', { foreignKey, localKey })
  const dataLoader = relation.createDataLoader(User, scope)
  const expected = await expectedFn(Message, users)
    .then(([jon, sansa]) => ({ jon, sansa }))

  const spy = sinon.spy(Message, 'query')
  const actual = await Promise
    .all([
      dataLoader(users.jon),
      dataLoader(users.sansa)
    ])
    .then(([jon, sansa]) => ({ jon, sansa }))

  spy.restore()

  t.deepEqual(actual, expected)
  t.true(spy.calledOnce)
}

const createQueryForSingleMacro = Relation => async (t, options) => {
  const {
    expectedFn,
    foreignKey = undefined,
    localKey = 'id'
  } = options

  const { Message, users, User } = t.context
  const { jon } = users

  const relation = new Relation('Message', { foreignKey, localKey })
  const expected = await expectedFn(Message, jon)
  const actual = await relation.queryForSingle(User, jon[localKey])

  t.deepEqual(actual, expected)
}

module.exports = { createDataLoaderMacro, createQueryForSingleMacro }
