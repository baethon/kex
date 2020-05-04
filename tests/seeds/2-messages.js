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
        user_id: jon.id,
        text: 'Message #1'
      },
      {
        user_id: jon.id,
        text: 'Message #2'
      },
      {
        user_id: sansa.id,
        text: 'Message #3'
      },
      {
        user_id: sansa.id,
        text: 'Message #4'
      }
    ])
  }
}
