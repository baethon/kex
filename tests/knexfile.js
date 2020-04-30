const path = require('path')

module.exports = {
  client: process.env.DB_CLIENT || 'sqlite',
  connection: process.env.DB_URL || path.join(__dirname, 'db.sqlite'),
  migrations: {
    directory: path.join(__dirname, './migrations')
  },
  seeds: {
    directory: path.join(__dirname, './seeds')
  },
  useNullAsDefault: true
}
