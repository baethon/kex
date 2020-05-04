module.exports = {
  async seed (knex) {
    await knex('messages').del()

    const jon = await knex('users')
      .where('username', 'jon')
      .first()

    const sansa = await knex('users')
      .where('username', 'sansa')
      .first()

    return knex('messages').insert([
      {
        userId: jon.id,
        text: 'Message #1'
      },
      {
        userId: jon.id,
        text: 'Message #2'
      },
      {
        userId: sansa.id,
        text: 'Message #3'
      },
      {
        userId: sansa.id,
        text: 'Message #4'
      }
    ])
  }
}
