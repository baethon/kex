const sinon = require('sinon')

module.exports = Relation => {
  const macro = async (t, options) => {
    const {
      expectedFn,
      foreignKey = undefined,
      localKey = undefined,
      scope = undefined
    } = options

    const { Message, users, User } = t.context

    const relation = new Relation('Message', foreignKey, localKey)
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

  macro.title = (providedTitle, { expectedFn, foreignKey, localKey, scope }) => {
    const v = (name, value) => value
      ? `${name}=${value}`
      : `${name}=`

    const chunks = [
      v('foreignKey', foreignKey),
      v('localKey', localKey),
      v('scope', scope)
    ]

    return chunks.join(', ')
  }

  return macro
}
