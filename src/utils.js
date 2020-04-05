const setClassName = (Type, name) => {
  Object.defineProperty(Type, 'name', { value: name })
}

module.exports = { setClassName }
