/* eslint no-console: [0] */

'use strict'
const _ = require('lodash')
const Sequelize = require('sequelize')

module.exports = {
  /**
   * Augment the model definition with some sequelize-required properties
   */
  transformModels (app) {

    // const models = app.models

    return _.mapValues(app.models, (model, modelName) => {
      const config = model.constructor.config(app, Sequelize) || {}
      const schema = model.constructor.schema(app, Sequelize) || {}

      if (!config.options){
        config.options = {}
      }

      if (!config.options.tableName) {
        config.options.tableName = modelName.toLowerCase()
      }

      Object.defineProperties(model, {
        identity: {
          value: modelName.toLowerCase(),
          writable: false
        },
        Sequelize: {
          value: Sequelize,
          writable: true
        },
        globalId: {
          value: modelName,
          writable: false
        },
        tableName: {
          value: config.tableName || modelName.toLowerCase(),
          writable: false
        },
        store: {
          value: config.store || app.config.get('models.defaultStore'),
          writable: false
        },
        migrate: {
          value: config.migrate || app.config.get('models.migrate'),
          writable: false
        },
        options: {
          value: config.options,
          writable: true
        },
        schema: {
          value: schema,
          writable: true
        }
      })
      return model
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
  pickStoreConnections (stores) {
    return _.pickBy(stores, (_store, name) => {
      return ((_store.dialect && _.isString(_store.dialect))
        || _.startsWith(_store.uri, 'mysql://')
        || _.startsWith(_store.uri, 'mysql://')
        || _.startsWith(_store.uri, 'postgresql://')
        || _.startsWith(_store.uri, 'sqlite://'))
    })
  },

  /**
   * Transform the Trails.js "stores" config into a Sequelize object
   */
  transformStoreConnections (app) {
    const stores = this.pickStoreConnections(app.config.get('stores'))
    const sequelize = {}
    Object.keys(stores).forEach(key => {
      sequelize[key] = this.createFromConfig(stores[key])
      sequelize[key].trailsApp = app
    })

    return sequelize
  }

}
