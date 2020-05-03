const test = require('ava')
const { Kex } = require('../')

const createKex = ({ context }, options = {}) => {
  return new Kex(context.knex, options)
}

const onlyForClient = (dbClient, name, testFn) => {
  if (dbClient !== process.env.DB_CLIENT) {
    return test.skip(`${name} (only for DB_CLIENT = '${dbClient}')`, testFn)
  }

  test(name, testFn)
}

module.exports = { createKex, onlyForClient }
