'use strict'
const _ = require('lodash')
const Sequelize = require('sequelize')

module.exports = {

  /**
   * Augment the model definition with some sequelize-required properties
   */
  transformModels (app) {
    const models = app.models
    const dbConfig = app.config.database
    return _.mapValues(models, (model, modelName) => {
      const config = model.constructor.config() || {}
      const schema = model.constructor.schema() || {}

      if (!config.options){
        config.options = {}
      }

      if (!config.options.tableName) {
        config.options.tableName = modelName.toLowerCase()
      }

      return {
        identity: modelName.toLowerCase(),
        globalId: modelName,
        tableName: config.tableName || modelName.toLowerCase(),
        connection: config.store || dbConfig.models.defaultStore,
        migrate: config.migrate || dbConfig.models.migrate,
        config: config.options,
        schema: schema
      }

    })
  },

  /**
   * Transform the Trails.js "stores" config into a Sequelize object
   */
  transformStores (app) {
    const stores = app.config.database.stores
    const sequelize = {}
    Object.keys(stores).forEach(key => {
      sequelize[key] = new Sequelize(stores[key].database, stores[key].username, stores[key].password, stores[key])
    })

    return sequelize
  }

}
