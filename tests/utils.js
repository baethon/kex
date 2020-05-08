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

const unwrapData = value => JSON.parse(JSON.stringify(value))

/**
 * Compare database results
 *
 * Mysql client wraps rows in a data object which fails to pass the equality check.
 * Since we focus on data, this method removes the wrapping objects and compares
 * plaing JS arrays/objects
 *
 * @param {Object} t
 * @param {Object|Object[]} expected
 * @param {Object|Object[]} actual
 */
const compareDbResults = (t, expected, actual) => {
  t.deepEqual(unwrapData(actual), unwrapData(expected))
}

module.exports = { createKex, onlyForClient, compareDbResults }
