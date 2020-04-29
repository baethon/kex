module.exports = {
  async seed (knex) {
    await knex('users').del()

    return knex('users').insert([
      { first_name: 'Jon', last_name: 'Snow', active: true },
      { first_name: 'Sansa', last_name: 'Stark', active: false }
    ])
  }
}
