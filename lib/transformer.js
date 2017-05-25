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
      const config = model.constructor.config(app, Sequelize) || {}
      const schema = model.constructor.schema(app, Sequelize) || {}

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
   * Create Sequelize object based on config options
   * @param  {Object} config Trails.js store
   * @return {Sequelize}     Sequelize instance
   */
  createFromConfig (config) {
    if (config.uri) {
      return new Sequelize(config.uri, _.clone(config)) // Sequelize modify options object
    }
    else {
      return new Sequelize(config.database, config.username, config.password, config)
    }
  },
  
  /**
	 * Pick only SQL stores from app config
	 * @param {Object} stores
	 * @return {Object}
	 */
	pickStores (stores) {
		return _.pickBy(stores, (_store, name) => {
			return (_store.dialect && _.isString(_store.dialect))
		})
	},

  /**
   * Transform the Trails.js "stores" config into a Sequelize object
   */
  transformStores (app) {
    const stores = this.pickStores(app.config.database.stores)
    const sequelize = {}
    Object.keys(stores).forEach(key => {
      sequelize[key] = this.createFromConfig(stores[key])
      sequelize[key].trailsApp = app
    })

    return sequelize
  }

}
