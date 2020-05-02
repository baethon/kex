module.exports = {
  async seed (knex) {
    await knex('users').del()

    return knex('users').insert([
      { username: 'jon', first_name: 'Jon', last_name: 'Snow', active: true },
      { username: 'sansa', first_name: 'Sansa', last_name: 'Stark', active: false }
    ])
  }
}
