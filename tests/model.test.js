const test = require('ava')
const sinon = require('sinon')
const setupDb = require('./setup-db')
const { createKex } = require('./utils')
const Model = require('../src/model')

setupDb()

test.serial.before(t => {
  t.context.kex = createKex(t)
})

test('build model instance', t => {
  const { kex } = t.context
  const Foo = new Model(kex, 'Foo')

  t.is('foos', Foo.tableName)
  t.is('id', Foo.primaryKey)
  t.is(kex, Foo.kex)
  t.is('Foo', Foo.name)
})

test('build model instance | models don\'t share same QueryBuilder', t => {
  const { kex } = t.context
  const Foo = new Model(kex, 'Foo')
  const Other = new Model(kex, 'Other')

  t.false(Foo.QueryBuilder === Other.QueryBuilder)
})

test('build model instance | custom table name', t => {
  const { kex } = t.context
  const Foo = new Model(kex, 'Foo', { tableName: 'my_foo' })

  t.is('my_foo', Foo.tableName)
})

test('build model instance | custom primary key', t => {
  const { kex } = t.context
  const Foo = new Model(kex, 'Foo', { primaryKey: 'my_foo' })

  t.is('my_foo', Foo.primaryKey)
})

test('extend() | add query proxy', t => {
  const { kex } = t.context
  const Foo = new Model(kex, 'Foo')

  const result = Symbol('query result')
  const macro = function () {
    t.true(this instanceof Foo.QueryBuilder)
    return result
  }

  Foo.extend({
    methodName: 'test',
    fn: macro,
    queryProxy: true
  })

  t.plan(4)

  t.is(result, Foo.test())
  t.is(result, Foo.query().test())
})

test.serial('use custom query resolver', t => {
  const { kex } = t.context
  const client = Symbol('fake knex client')

  const Foo = new Model(kex, 'Foo', {
    knexClientResolver () {
      return client
    }
  })

  const spy = sinon.spy(Foo.QueryBuilder, 'create')
  Foo.query()
  spy.restore()

  t.true(spy.calledWith(client))
})
