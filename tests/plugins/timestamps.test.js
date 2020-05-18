const test = require('ava')
const sinon = require('sinon')
const faker = require('faker')
const setupDb = require('../setup-db')
const { createKex, userFactory } = require('../utils')

setupDb()

const timestampFields = {
  created: null,
  created_at: null,
  updated: null,
  updated_at: null
}
const userData = userFactory()

test.before(t => {
  // eliminate the milliseconds precision from current time
  // without it, MySQL might return weird results
  const now = Math.floor(new Date().getTime() / 1000)
  const clock = sinon.useFakeTimers({ now: new Date(now * 1000) })

  t.context.clock = clock
})

test.beforeEach(async t => {
  const { knex } = t.context

  const trx = await knex.transaction()
  const kex = createKex(t, {
    knexClientResolver: () => trx.client
  })

  Object.assign(t.context, { kex, trx })
})

test.afterEach.always(async t => {
  const { trx } = t.context

  await trx.rollback()
})

test.serial('disabled timestamps', async t => {
  const { kex } = t.context

  const User = kex.createModel('User')
  const [id] = await User.returning('id')
    .insert(userData)

  await User.query()
    .where({
      ...userData,
      ...timestampFields
    })
    .firstOrFail()

  const firstName = faker.name.firstName()

  await User.find(id)
    .update({ first_name: firstName })

  await User.query()
    .where({
      ...userData,
      ...timestampFields,
      first_name: firstName
    })
    .firstOrFail()

  t.pass()
})

test.serial('insert | default columns', async t => {
  const { kex } = t.context
  const User = kex.createModel('User', {
    timestamps: true
  })

  await User.insert(userData)
  await User.query()
    .where({
      ...userData,
      ...timestampFields,
      updated_at: new Date(),
      created_at: new Date()
    })
    .firstOrFail()

  t.pass()
})

test.serial('insert | list of items', async t => {
  const { kex } = t.context
  const User = kex.createModel('User', {
    timestamps: true
  })

  const data = [
    userFactory(),
    userFactory()
  ]

  await User.insert(data)

  await Promise.all(data.map(item => User.query()
    .where({
      ...item,
      ...timestampFields,
      updated_at: new Date(),
      created_at: new Date()
    })
    .firstOrFail()
  ))

  t.pass()
})

test.serial('insert | custom column name', async t => {
  const { kex } = t.context
  const User = kex.createModel('User', {
    timestamps: { createdAtColumn: 'created', updatedAtColumn: 'updated' }
  })

  await User.insert(userData)
  await User.query()
    .where({
      ...userData,
      ...timestampFields,
      created: new Date(),
      updated: new Date()
    })
    .firstOrFail()

  t.pass()
})

test.serial('update | default columns', async t => {
  const { kex, clock } = t.context
  const User = kex.createModel('User', {
    timestamps: true
  })

  const createdAt = new Date()
  const [id] = await User.returning('id')
    .insert(userData)

  clock.tick(1000)

  const firstName = faker.name.firstName()

  await User.find(id)
    .update({ first_name: firstName })

  await User.query()
    .where({
      ...userData,
      first_name: firstName,
      created_at: createdAt,
      updated_at: new Date()
    })
    .firstOrFail()

  t.pass()
})

test.serial('update | custom column name', async t => {
  const { kex } = t.context
  const User = kex.createModel('User', {
    timestamps: { updatedAtColumn: 'updated' }
  })

  const jon = await User.where('username', 'jon')
    .firstOrFail()

  const firstName = faker.name.firstName()

  await User.find(jon.id)
    .update({ first_name: firstName })

  await User.query()
    .where({
      ...jon,
      first_name: firstName,
      updated: new Date()
    })
    .firstOrFail()

  t.pass()
})
