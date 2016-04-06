'use strict'

const Service = require('trails-service')

/**
 * @module SchemaMigrationService
 * @description Schema Migrations
 */
module.exports = class SchemaMigrationService extends Service {

  /**
   * Drop collections in current connection
   * @param model model object
   */
  drop(model) {
    return model.sync({force: true})
  }

  /**
   * Alter an existing schema
   * @param model model object
   */
  alter(model) {
    return model.sync()
  }
}
