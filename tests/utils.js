const test = require('ava')
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

module.exports = { createKex, onlyForClient }
