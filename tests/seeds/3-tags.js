const tags = 'voluptatem accusantium doloremque laudantium totam righteous indignation'.split(' ')

const flatten = list => Array.prototype.concat.apply([], list)

const insertToPivot = (tableName, knex, options) => {
  const { createdTags, commonTags, users } = options

  return Promise.all([
    knex.table(tableName)
      .insert(createdTags.map((tag, i) => {
        const user = users[i % users.length]

        return {
          tag_id: tag.id,
          user_id: user.id
        }
      })),
    knex.table(tableName)
      .insert(flatten(commonTags.map(tag => users.map(user => ({
        tag_id: tag.id,
        user_id: user.id
      })))))
  ])
}

module.exports = {
  async seed (knex) {
    /** @type {Object[]} */
    const users = await knex.table('users')

    /** @type {Object[]} */
    const createdTags = await knex.table('tags')
      .insert(tags.map(title => ({ title })))
      .then(() => knex.table('tags'))

    const commonTags = createdTags.splice(-2)

    await Promise.all([
      insertToPivot('tag_user', knex, { createdTags, commonTags, users }),
      insertToPivot('user_tag', knex, { createdTags, commonTags, users }),
      knex.table('tag_user_using_strings')
        .insert(createdTags.map((tag, i) => {
          const user = users[i % users.length]

          return {
            tag: tag.title,
            username: user.username
          }
        }))
    ])
  }
}
