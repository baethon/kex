const { Kex } = require('../')

const createKex = ({ context }, options = {}) => {
  return new Kex(context.knex, options)
}

module.exports = { createKex }
