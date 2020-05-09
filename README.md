# @baethon/kex

Kex is a query extension for [Knex](https://knexjs.org/). It uses the concept of "model" from ORMs like [Lucid](https://github.com/adonisjs/lucid), or [Laravel Eloquent](https://laravel.com/docs/7.x/eloquent) restricted only to making queries. It has support for scopes, plugins, relations and many more. 

## Installation

Install the package:

```
npm i @baethon/kex
```

Set up Kex instance:

```js
const knex = require('knex')({ /* ... */ })
const { Kex } = require('@baethon/kex')

const kex = new Kex({ knex })
```

Create first model:

```js
const User = kex.createModel('User')
```

## Making queries

Kex models uses the Knex query builder. To start the query, use `query()` method:

```js
const usersList = await User.query()
```

The query object is chainable:

```js
const activeUsers = await User.query()
  .where({ active: true })
```

In some cases, you can omit the `query()` method and start chaining using following methods:

- `where()`
- all scope methods
- `insert()`
- `returning()`

```js
const activeUsers = await User.where({ active: true })
```

Unlike Knex, the models don't create a query when using other methods (e.g. `andWhere()` etc).

## Creating new records

```js
await User.insert({ name: 'Jon' })
```

As in Knex, you should use `returning()` when you want to receive the returning fields:

```js
const [id] = await User.returning('id')
  .insert({ name: 'Jon' })
```

## Updating records

```js
User.where({ active: true })
  .update({ active: false })
```

## Scopes

[Scope](https://github.com/baethon/kex/wiki/Scopes) is a function that alters the query. They can be chained in a same way as other query methods.

Scopes are declared when creating a model:

```js
const User = kex.createModel('User', {
  scopes: {
    active (qb) {
      qb.where('active', true)
    }
  }
})

const activeUsers = await User.active()
```

Scopes can be used in the callbacks of `where()`:

```js 
const usersList = await User.where(qb => {
  qb.active()
    .orWhere('role', 'admin')
})
```

## Global scopes

[Global scope](https://github.com/baethon/kex/wiki/Scopes#global-scopes) is very similar to regular scope. The main difference is that it's applied automatically to every query.

```js 
const User = kex.createModel('User', {
  globalScopes: {
    active (qb) {
      qb.where('active', true)
    }
  }
})

const activeUsers = await User.query()
```

It's possible to ignore the scope using `withoutGlobalScope()`, or `withoutGlobalScopes()` method:

```js
const usersList = await User.query()
  .withoutGlobalScope('active')
  // alternative syntax:
  // .withoutGlobalScopes(['active'])
```

## Other

Kex supports many other things:

- [plugins](https://github.com/baethon/kex/wiki/Plugins)
- [soft-deletes](https://github.com/baethon/kex/wiki/Soft-deletes)
- [timestamps](https://github.com/baethon/kex/wiki/Timestamps)
- [relations](https://github.com/baethon/kex/wiki/Relations)
- [query utilities](https://github.com/baethon/kex/wiki/Query-utilities)

## Conventions

Kex uses naming conventions taken from Lucid, or Eloquent:

- table name is a snake_case version of pluralized model name (e.g. `users`)
- the primary key is always `id`
- foreign keys (used in relations) are snake_case version of table name (in singular form) postfixed with `_id` (e.g. `user_id`)
- pivot table are a snake_case version of related table names (in singular form) joined in alphabetical order (e.g. `tag_user`)

The naming can be altered using the configuration objects passed to the model.

## But... why?

That's a great question! I've worked with a few Node ORMs. All of them have some problems. With my recent project, I used one of them. Quickly it became a problem. I decided to switch to a different one. Even worse. Then, a good mentor suggested that maybe I should use raw queries? Nah! Wait, Knex is very close to "raw". It has a nice migrations manager and a powerful query builder. It was a good choice.

With this experience in mind I started to wonder - do I need an ORM? Do I _want_ an ORM? No! However, what I miss in Knex are the things which I love in Lucid, or Eloquent - scopes, relations, extensions, and some conventions. Kex tries to bring those concepts to Knex, but limit them only to queries. There won't be any active-record models and no hydration. Just queries and ways to manipulate them.

## Testing

The test suite is a combination of unit tests and integration tests. The latter use by default a SQLite database, however you can (and sometimes must) choose a different database backend.

To run tests:

```
yarn test
```

Running single test suite with:

```
yarn test tests/path/to/test-file.test.js
```

### Using different database backend

You will need to install client dependency:

- `mysql` for MySQL database
- `pg` for PostgreSQL database

Then, start the database and set env variables. The test suite supports two env variables:

- `DB_CLIENT` (either `mysql` or `pg`)
- `DB_URL` (e.g. `mysql://user:passwd@host:3306/db_name`)

```
DB_CLIENT=mysql DB_URL=mysql://user:passwd@host:3306/db_name yarn test
```
