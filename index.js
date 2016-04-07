'use strict'

const Trailpack = require('trailpack-datastore')
const lib = require('./lib')
const _ = require('lodash')

module.exports = class SequelizeTrailpack extends Trailpack {

  /**
   * Validate the database config, and api.model definitions
   */
  validate() {
    return Promise.all([
      lib.Validator.validateDatabaseConfig(this.app.config.database)
    ])
  }

  /**
   * Merge configuration into models, load Sequelize collections.
   */
  configure() {
    this.app.config.database.orm = 'sequelize'

    _.merge(this.app.config, lib.FailsafeConfig)

  }

  /**
   * Initialize Sequelize. This will compile the schema and connect to the
   * database.
   */
  initialize() {
    super.initialize()

    this.orm = this.orm || {};
    this.connections = lib.Transformer.transformStores(this.app)
    this.models = lib.Transformer.transformModels(this.app)

    _.each(this.connections, (connection, name) => {
      _.each(this.models, (model, modelName) => {
        if (model.connection == name) {
          this.orm[model.globalId] = connection.define(modelName, model.schema, model.config)
        }
      })
    })

    _.each(this.models, (model, modelName) => {
      if (this.orm[model.globalId].associate)
        this.orm[model.globalId].associate(this.orm)
    })

    this.app.orm = this.orm

    return this.migrate()
  }

  /**
   * Close all database connections
   */
  unload() {
    return Promise.all(
      _.map(this.connections, connection => {
        return new Promise((resolve, reject) => {
          connection.close((err) => {
            if (err)
              return reject(err)

            resolve()
          })
        })
      })
    )
  }

  migrate() {
    const SchemaMigrationService = this.app.services.SchemaMigrationService

    return Promise.all(
      _.map(this.models, model => {
        if (model.migrate == 'drop') {
          return SchemaMigrationService.dropModel(this.orm[model.globalId])
        }
        else if (model.migrate == 'alter') {
          return SchemaMigrationService.alterModel(this.orm[model.globalId])
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

