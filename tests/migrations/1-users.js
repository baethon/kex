module.exports = {
  up (knex) {
    return knex.schema
      .createTable('users', (table) => {
        table.increments('id')
        table.string('username')
        table.string('first_name')
        table.string('last_name')
        table.boolean('active').default(false)
      })
  },

  down (knex) {
    return knex.schema.dropTable('users')
  }
}
