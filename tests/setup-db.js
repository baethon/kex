const knex = require('knex')
const test = require('ava')

module.exports = () => {
  test.before(async t => {
    t.context.knex = knex(require('./knexfile'))
  })
}
