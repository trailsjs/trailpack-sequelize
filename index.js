/* eslint no-console: [0] */
'use strict'

const Trailpack = require('trailpack/datastore')
const lib = require('./lib')
const _ = require('lodash')

module.exports = class SequelizeTrailpack extends Trailpack {

  /**
   * Validate the database config, and api.model definitions
   */
  async validate() {
    const stores = this.app.config.get('stores')
    const models = this.app.config.get('models')

    if (stores && Object.keys(stores).length === 0) {
      this.app.config.log.logger.warn('No store configured at config.stores, models will be ignored')
    }

    return Promise.all([
      lib.Validator.validateStoresConfig(stores),
      lib.Validator.validateModelsConfig(models)
    ])
  }

  /**
   * Merge configuration into models, load Sequelize collections.
   */
  configure() {
    this.app.config.set('stores.orm', 'sequelize')
    _.merge(this.app.config, lib.FailsafeConfig)
  }

  /**
   * Initialize Sequelize. This will compile the schema and connect to the
   * database.
   */
  initialize() {
    super.initialize()

    this.orm = this.orm || {}
    this.app.orm = {}
    this.connections = lib.Transformer.transformStoreConnections(this.app)
    this.app.models = lib.Transformer.transformModels(this.app)

    this.stores = _.mapValues(this.app.config.get('stores'), (store, storeName) => {
      return {
        models: _.pickBy(this.app.models, { store: storeName }),
        connection: this.connections[storeName],
        migrate: store.migrate || this.app.config.get('models.migrate')
      }
    })

    // Loop through store models and define them in Sequelize
    _.each(this.stores, (store, storeName) => {
      _.each(store.models, (model, modelName) => {
        const Model = store.connection.define(modelName, model.schema, model.options)

        if (model.options) {
          if (model.options.classMethods) {
            for (const methodName in model.options.classMethods) {
              Model[methodName] = model.options.classMethods[methodName]
            }
          }

          if (model.options.instanceMethods) {
            for (const methodName in model.options.instanceMethods) {
              Model.prototype[methodName] = model.options.instanceMethods[methodName]
            }
          }
        }
        this.app.orm[model.globalId] = Model
      })
    })

    // Loop through store models and associate
    _.each(this.stores, (store, storeName) => {
      // Run Associate on the Models
      _.each(store.models, (model, modelName) => {
        // ignore model if not configured
        if (!this.app.orm[model.globalId]) {
          return
        }
        // Associate models if method defined
        if (this.app.orm[model.globalId].associate) {
          this.app.orm[model.globalId].associate(this.app.orm)
        }

        // Reset the orm Model
        this.orm[model.globalId.toLowerCase()] = this.app.orm[model.globalId]
      })
    })

    return this.migrate()
  }

  /**
   * Close all database connections
   */
  async unload() {
    return Promise.all(
      _.map(this.stores, store => {
        return new Promise((resolve, reject) => {
          store.connection.close()
          resolve()
        })
      })
    )
  }

  async migrate() {
    const SchemaMigrationService = this.app.services.SchemaMigrationService

    return Promise.all(
      _.map(this.stores, store => {
        if (store.migrate === 'drop') {
          return SchemaMigrationService.dropDB(store.connection)
        }
        else if (store.migrate === 'alter') {
          return SchemaMigrationService.alterDB(store.connection)
        }
        else if (store.migrate === 'none') {
          return
        }
        else {
          return
        }
      })
    )
  }

  constructor(app) {
    super(app, {
      config: require('./config'),
      api: require('./api'),
      pkg: require('./package')
    })
  }
}

