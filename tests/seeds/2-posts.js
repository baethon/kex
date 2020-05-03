module.exports = {
  async seed (knex) {
    await knex('posts').del()

    const jon = await knex('users')
      .where('username', 'jon')
      .first()

    return knex('posts').insert([
      {
        userId: jon.id,
        title: 'post-1'
      },
      {
        userId: jon.id,
        title: 'post-2'
      }
    ])
  }
}
