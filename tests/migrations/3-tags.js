module.exports = {
  up (knex) {
    return knex.schema
      .createTable('tags', (table) => {
        table.increments('id')
        table.string('title').unique()
      })
      .createTable('tag_user', (table) => {
        table.integer('tag_id').unsigned()
        table.integer('user_id').unsigned()

        table.foreign('tag_id').references('tags.id')
        table.foreign('user_id').references('users.id')
      })
      .createTable('user_tag', (table) => {
        table.integer('tag_id').unsigned()
        table.integer('user_id').unsigned()

        table.foreign('tag_id').references('tags.id')
        table.foreign('user_id').references('users.id')
      })
      .createTable('tag_user_using_strings', (table) => {
        table.string('tag')
        table.string('username')

        table.foreign('tag').references('tags.title')
        table.foreign('username').references('tags.username')
      })
  },

  down (knex) {
    return knex.schema
      .dropTable('tag_user_using_strings')
      .dropTable('user_tag')
      .dropTable('tag_user')
      .dropTable('tags')
  }
}
