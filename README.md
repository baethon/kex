![Node.js CI](https://github.com/baethon/kex/workflows/Node.js%20CI/badge.svg?branch=master)
[![npm version](https://badge.fury.io/js/%40baethon%2Fkex.svg)](https://badge.fury.io/js/%40baethon%2Fkex)

# @baethon/kex

Kex is a query extension for [Knex](https://knexjs.org/). It uses the concept of "model" from ORMs like [Lucid](https://github.com/adonisjs/lucid), or [Laravel Eloquent](https://laravel.com/docs/7.x/eloquent) restricted only to make queries. It has support for scopes, plugins, relations, and many more.

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
- `whereIn()`
- `insert()`
- `returning()`

```js
const activeUsers = await User.where({ active: true })
```

Unlike Knex, the models don't create a query when using other methods (e.g. `andWhere()`).

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
  
// to make an update of a single item you can use
// following query
User.find(userId)
  .update({ active: true })
```

## Scopes

[Scope](https://github.com/baethon/kex/wiki/Scopes) is a function that alters the query. You can chain them as other query methods.

Scopes are declared when creating a model:

```js
const User = kex.createModel('User', {
  scopes: {
    active (qb) {
      qb.where('active', true)
    }
  }
})

const activeUsers = await User.query()
  .active()
```

Scopes can be used in the callbacks of `where()`:

```js 
const usersList = await User.where(qb => {
  qb.active()
    .orWhere('role', 'admin')
})
```

## Global scopes

[Global scope](https://github.com/baethon/kex/wiki/Scopes#global-scopes) is very similar to the regular scope. The main difference is that it's applied automatically to every query.

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

- the table name is a snake_case version of the pluralized model name (e.g. `users`)
- the primary key is always `id`
- foreign keys (used in relations) are snake_case version of a table name (in singular form) postfixed with `_id` (e.g. `user_id`)
- the pivot table is a snake_case version of related table names (in singular form) joined in alphabetical order (e.g. `tag_user`)

The naming is fully customizable.

## Motivation

Full-blown ORMs offer fantastic features. Yet sometimes, it might be overkill for your application. What I needed is a customizable DBAL which wouldn't make too much magic behind the scenes. I wanted something like Knex, yet a little more robust.

Kex gives you the feeling of an ORM. However, it makes sure not to interfere with your work. Build a query and fetch the results. That's all. Don't worry about hydrated objects, results collections, or anything like that.

## Testing

The test suite is a combination of unit tests and integration tests. The latter use by default an SQLite database, however, you can (and sometimes must) choose a different database backend.

To run tests:

```
yarn test
```

Running a single test suite with:

```
yarn test tests/path/to/test-file.test.js
```

### Using different database backend

You need to install client dependency:

- `mysql` for MySQL database
- `pg` for PostgreSQL database

Then, start the database and set env variables. The test suite supports two env variables:

- `DB_CLIENT` (either `mysql` or `pg`)
- `DB_URL` (e.g. `mysql://user:passwd@host:3306/db_name`)

```
DB_CLIENT=mysql DB_URL=mysql://user:passwd@host:3306/db_name yarn test
```
