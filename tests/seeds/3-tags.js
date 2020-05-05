const tags = 'voluptatem accusantium doloremque laudantium totam'.split(' ')

module.exports = {
  async seed (knex) {
    /** @type {Object[]} */
    const users = await knex.table('users')

    /** @type {Object[]} */
    const createdTags = await knex.table('tags')
      .insert(tags.map(title => ({ title })))
      .then(() => knex.table('tags'))

    await knex.table('tag_user')
      .insert(createdTags.map((tag, i) => {
        const user = users[i % users.length]

        return {
          tag_id: tag.id,
          user_id: user.id
        }
      }))

    await knex.table('user_tag')
      .insert([...createdTags].reverse().map((tag, i) => {
        const user = users[i % users.length]

        return {
          tag_id: tag.id,
          user_id: user.id
        }
      }))

    await knex.table('tag_user_using_strings')
      .insert(createdTags.map((tag, i) => {
        const user = users[i % users.length]

        return {
          tag: tag.title,
          username: user.username
        }
      }))
  }
}
