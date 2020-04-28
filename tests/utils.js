const Kex = require('../')

const createKex = ({ context }) => {
  return new Kex(context.knex)
}

module.exports = { createKex }
