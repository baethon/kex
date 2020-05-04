module.exports = {
  up (knex) {
    return knex.schema
      .createTable('messages', (table) => {
        table.increments('id')
        table.integer('userId').unsigned().notNullable()
        table.string('text')
        table.datetime('deleted_at').nullable()

        table.foreign('userId').references('users.id')
      })
  },

  down (knex) {
    return knex.schema.dropTable('messages')
  }
}
