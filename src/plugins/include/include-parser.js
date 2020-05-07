const { isObject, noop } = require('../../utils')
const IncludeScope = require('./include-scope')

const normalizeIncludes = (includesList) => {
  return includesList.reduce(
    (carry, include) => ({
      ...carry,
      ...(isObject(include)
        ? include
        : { [include]: noop }
      )
    }),
    {}
  )
}

const parseIncludes = (...args) => {
  const [first] = args
  const list = Array.isArray(first)
    ? first
    : args

  return normalizeIncludes(list)
}

const getPathInfo = (path) => {
  const [root, ...include] = path.split('.')
  return {
    root,
    include: include.length
      ? include.join('.')
      : null
  }
}

/**
 * @param {Object.<String, Scope>} includesList
 * @return {Object.<String, IncludeScope>}
 */
const groupIncludes = (includesList) => {
  /** @type Map<String, IncludeScope> */
  const groups = new Map()

  Object.entries(includesList)
    .forEach(([path, scope]) => {
      const { root, include } = getPathInfo(path)

      if (!groups.has(root)) {
        groups.set(root, new IncludeScope())
      }

      const rootScope = groups.get(root)

      if (include) {
        rootScope.addInclude(include, scope)
      } else {
        rootScope.setScope(scope)
      }
    })

  return Object.fromEntries(groups.entries())
}

module.exports = { parseIncludes, groupIncludes }
