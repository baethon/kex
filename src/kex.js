const createModel = require('./create-model')

class Kex {
  constructor (knex) {
    this.models = {}
    this.knex = knex
  }

  createModel (name, options = {}) {
    this.models[name] = createModel(this.knex, name, options)
    return this.models[name]
  }
}

module.exports = Kex
