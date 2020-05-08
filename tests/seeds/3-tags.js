const tags = 'voluptatem accusantium doloremque laudantium totam common-1 common-2'.split(' ')

const flatten = list => Array.prototype.concat.apply([], list)
const shuffleArray = (array) => {
  const copy = [...array]

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }

  return copy
}

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

const connectMessages = async (knex, tags) => {
  const messages = await knex.table('messages')
    .whereNull('deleted_at')

  const data = messages.map(item => {
    const pickElements = Math.floor(Math.random() * tags.length)
    const pickedTags = shuffleArray(tags).slice(0, pickElements)

    return pickedTags.map(tag => ({
      tag_id: tag.id,
      message_id: item.id
    }))
  })

  return knex.table('message_tag')
    .insert(flatten(data))
}

module.exports = {
  async seed (knex) {
    /** @type {Object[]} */
    const users = await knex.table('users')

    /** @type {Object[]} */
    const createdTags = await knex.table('tags')
      .insert(tags.map(title => ({ title })))
      .then(() => knex.table('tags')
        .orderBy('id', 'asc')
      )

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
        })),
      connectMessages(knex, [...createdTags, ...commonTags])
    ])
  }
}
