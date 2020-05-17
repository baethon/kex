const test = require('ava')
const faker = require('faker')
const { Kex } = require('../')

const createKex = (t, options = {}) => {
  const { knex } = t.context
  return new Kex({
    ...options,
    knex
  })
}

const onlyForClient = (dbClient, name, testFn) => {
  if (dbClient !== process.env.DB_CLIENT) {
    return test.skip(`${name} (only for DB_CLIENT = '${dbClient}')`, testFn)
  }

  test(name, testFn)
}

const userFactory = () => ({
  username: faker.internet.userName(),
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  active: true
})

module.exports = { createKex, onlyForClient, userFactory }
