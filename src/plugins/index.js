const builtinPlugins = [
  require('./find'),
  require('./first-or-fail'),
  require('./soft-deletes'),
  require('./include'),
  require('./timestamps')
]

/** @typedef { import('../model) } Model */

/**
 * @callback PluginFactory
 * @param {Model} Model
 */

/**
 * Apply the list of plugins to the Model
 *
 * @param {PluginFactory[]} plugins
 * @param {Model} Model
 * @return {Model}
 */
const applyPlugins = function (plugins, Model) {
  plugins.forEach(fn => {
    fn(Model)
  })

  return Model
}

module.exports = { builtinPlugins, applyPlugins }
