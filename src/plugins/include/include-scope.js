const { noop } = require('../../utils')

/** @typedef { import('../../query-builder').Scope } Scope */

class IncludeScope {
  constructor () {
    this.scope = noop
    this.includes = []
  }

  /**
   * @param {Scope} scope
   * @return {IncludeScope}
   */
  setScope (scope) {
    this.scope = scope

    return this
  }

  /**
   * @param {String} namesList
   * @param {Scope} [scope]
   * @return {IncludeScope}
   */
  addInclude (name, scope) {
    this.includes.push(scope
      ? { [name]: scope }
      : name
    )

    return this
  }

  /**
   * Create a scope function
   *
   * @return {Scope}
   */
  toScopeFn () {
    return qb => {
      this.scope(qb)
      qb.include(this.includes)
    }
  }
}

module.exports = IncludeScope
