const payload = {}

function buildConfig(config) {
  return config || {}
}

module.exports = {
  ...payload,
  buildConfig,
  default: payload,
}