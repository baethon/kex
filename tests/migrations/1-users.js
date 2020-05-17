module.exports = {
  up (knex) {
    return knex.schema
      .createTable('users', (table) => {
        table.increments('id')
        table.string('username').unique()
        table.string('first_name')
        table.string('last_name')
        table.boolean('active').default(false)
        table.datetime('created').nullable().default(null)
        table.datetime('updated').nullable().default(null)
        table.datetime('created_at').nullable().default(null)
        table.datetime('updated_at').nullable().default(null)
      })
  },

  down (knex) {
    return knex.schema.dropTable('users')
  }
}
