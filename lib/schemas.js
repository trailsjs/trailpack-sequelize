'use strict'
const joi = require('joi')

module.exports = {
  storesConfig: joi.object().keys({
    orm: joi.string()
  }).unknown(),

  modelsConfig: joi.object().keys({
    defaultStore: joi.string(),
    migrate: joi.string()
  }).unknown(),

  models: joi.object().keys({
    autoPK: joi.boolean(),
    autoCreatedAt: joi.boolean(),
    autoUpdatedAt: joi.boolean(),
    attributes: joi.object()
  })
}
