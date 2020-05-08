const test = require('ava')
const setupDb = require('./setup-db')
const { createKex } = require('./utils')
const { createModel } = require('../src/model')

setupDb()

test.serial.before(t => {
  t.context.kex = createKex(t)
})

test('build model instance', t => {
  const { kex } = t.context
  const Model = createModel(kex, 'Foo')

  t.is('foos', Model.tableName)
  t.is('id', Model.primaryKey)
  t.is(kex, Model.kex)
  t.is('Foo', Model.name)
})

test('build model instance | models don\'t share same QueryBuilder', t => {
  const { kex } = t.context
  const Model = createModel(kex, 'Foo')
  const Other = createModel(kex, 'Other')

  t.false(Model.QueryBuilder === Other.QueryBuilder)
})

test('build model instance | custom table name', t => {
  const { kex } = t.context
  const Model = createModel(kex, 'Foo', { tableName: 'my_foo' })

  t.is('my_foo', Model.tableName)
})

test('build model instance | custom primary key', t => {
  const { kex } = t.context
  const Model = createModel(kex, 'Foo', { primaryKey: 'my_foo' })

  t.is('my_foo', Model.primaryKey)
})

test('addQueryMacro()', t => {
  const { kex } = t.context
  const Model = createModel(kex, 'Foo')

  const result = Symbol('query result')
  const macro = function () {
    t.true(this instanceof Model.QueryBuilder)
    return result
  }

  Model.addQueryMacro('test', macro)

  t.plan(4)

  t.is(result, Model.test())
  t.is(result, Model.query().test())
})
