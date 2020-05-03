module.exports = {
  up (knex) {
    return knex.schema
      .createTable('posts', (table) => {
        table.increments('id')
        table.integer('userId').unsigned().notNullable()
        table.string('title')

        table.foreign('userId').references('users.id')
      })
  },

  down (knex) {
    return knex.schema.dropTable('posts')
  }
}
