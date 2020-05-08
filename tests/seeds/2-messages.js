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
        to_user: sansa.id,
        from_username: jon.username,
        text: 'Message #1'
      },
      {
        user_id: jon.id,
        to_user: sansa.id,
        from_username: jon.username,
        text: 'Message #2'
      },
      {
        user_id: jon.id,
        to_user: sansa.id,
        from_username: jon.username,
        text: 'Message.deleted #1',
        deleted_at: new Date()
      },
      {
        user_id: sansa.id,
        to_user: jon.id,
        from_username: sansa.username,
        text: 'Message #3'
      },
      {
        user_id: sansa.id,
        to_user: jon.id,
        from_username: sansa.username,
        text: 'Message #4'
      }
    ])
  }
}
