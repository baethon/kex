module.exports = {
  up (knex) {
    return knex.schema
      .createTable('messages', (table) => {
        table.increments('id')
        table.integer('user_id').unsigned().notNullable()
        table.string('text')
        table.datetime('deleted_at').nullable()

        table.foreign('user_id').references('users.id')
      })
  },

  down (knex) {
    return knex.schema.dropTable('messages')
  }
}
