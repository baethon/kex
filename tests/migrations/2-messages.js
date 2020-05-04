module.exports = {
  up (knex) {
    return knex.schema
      .createTable('messages', (table) => {
        table.increments('id')
        table.integer('user_id').unsigned().notNullable()
        table.integer('to_user').unsigned().notNullable()
        table.string('from_username')
        table.string('text')
        table.datetime('deleted_at').nullable()

        table.foreign('user_id').references('users.id')
        table.foreign('to_user').references('users.id')
      })
  },

  down (knex) {
    return knex.schema.dropTable('messages')
  }
}
