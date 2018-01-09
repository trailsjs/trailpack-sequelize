const joi = require('joi')
const lib = require('.')

module.exports = {
  validateStoresConfig (config) {
    return new Promise((resolve, reject) => {
      joi.validate(config, lib.Schemas.storesConfig, (err, value) => {
        if (err) return reject(err)

        return resolve(value)
      })
    })
  },
  validateModelsConfig (config) {
    return new Promise((resolve, reject) => {
      joi.validate(config, lib.Schemas.modelsConfig, (err, value) => {
        if (err) return reject(err)

        return resolve(value)
      })
    })
  }
}
