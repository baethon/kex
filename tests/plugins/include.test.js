const test = require('ava')
const setupDb = require('../setup-db')
const { createKex } = require('../utils')
const { HasMany, HasOne } = require('../../src/relations')

setupDb()

test.serial.before(async t => {
  const { knex } = t.context
  const kex = createKex(t)

  Object.assign(t.context, { kex })

  await knex.schema.createTable('foos', (table) => {
    table.increments('id')
    table.integer('message_id').unsigned()
  })

  const messages = await knex('messages').limit(2)

  await knex('foos')
    .insert(messages.map(message => ({
      message_id: message.id
    })))
})

test.after.always(async t => {
  const { knex } = t.context

  await knex.schema.dropTable('foos')
})

test('wip', async t => {
  const { kex } = t.context

  kex.createModel('Foo')
  const User = kex.createModel('User', {
    relations: {
      messages: new HasMany('Message')
    }
  })

  kex.createModel('Message', {
    softDeletes: true,
    relations: {
      foo: new HasOne('Foo')
    }
  })

  const result = await User.query()
    .include({
      // messages: qb => {}
      messages: qb => qb.include({
        foo: qb => {}
      })
    })

  console.log(JSON.stringify(result, null, 2))
  t.pass()
})
