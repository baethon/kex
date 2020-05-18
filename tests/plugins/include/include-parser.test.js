const test = require('ava')
const { parseIncludes, groupIncludes } = require('../../../src/plugins/include/parser')
const { noop } = require('../../../src/utils')
const IncludeScope = require('../../../src/plugins/include/include-scope')

test('parseIncludes() | parse single object', t => {
  const include = { foo: noop }
  t.deepEqual(include, parseIncludes(include))
})

test('parseIncludes() | parse list of arguments', t => {
  const expected = {
    foo: noop,
    'foo.bar': noop
  }

  t.deepEqual(expected, parseIncludes('foo', 'foo.bar'))
})

test('parseIncludes() | parse mixed list of arguments', t => {
  const qb = () => {}
  const expected = {
    foo: qb,
    'foo.bar': noop
  }

  t.deepEqual(expected, parseIncludes({ foo: qb }, 'foo.bar'))
})

test('parseIncludes() | use first array', t => {
  const expected = {
    foo: noop,
    'foo.bar': noop
  }

  t.deepEqual(expected, parseIncludes(['foo', 'foo.bar']))
})

test('groupIncludes() | don\'t group different relations', t => {
  const expected = new Map([
    ['foo', new IncludeScope(noop)],
    ['bar', new IncludeScope(noop)]
  ])

  t.deepEqual(expected, groupIncludes({
    foo: noop,
    bar: noop
  }))
})

test('groupIncludes() | group includes', t => {
  const qb = () => {} // don't replace it with the noop
  // it's all about the references
  const expected = new Map([
    ['foo', (new IncludeScope(noop)).addInclude('bar', qb)]
  ])

  t.deepEqual(expected, groupIncludes({
    foo: noop,
    'foo.bar': qb
  }))
})

test('groupIncludes() | set root scope', t => {
  const qb = () => {}
  const expected = new Map([
    ['foo', (new IncludeScope())
      .setScope(qb)
      .addInclude('bar', noop)]
  ])

  t.deepEqual(expected, groupIncludes({
    'foo.bar': noop,
    foo: qb
  }))
})

test('groupIncludes() | multiple nested includes', t => {
  const expected = new Map([
    ['foo', (new IncludeScope(noop))
      .addInclude('bar', noop)
      .addInclude('baz', noop)
      .addInclude('bar.bah', noop)]
  ])

  t.deepEqual(expected, groupIncludes({
    foo: noop,
    'foo.bar': noop,
    'foo.baz': noop,
    'foo.bar.bah': noop
  }))
})
