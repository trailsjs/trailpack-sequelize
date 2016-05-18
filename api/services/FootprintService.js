'use strict'

const _ = require('lodash')
const Service = require('trails-service')
const ModelError = require('../../lib').ModelError

/**
 * Trails Service that maps abstract ORM methods to their respective Waterine
 * methods. This service can be thought of as an "adapter" between trails and
 * Sequelize. All methods return native ES6 Promises.
 */
module.exports = class FootprintService extends Service {

  /**
   * Create a model, or models. Multiple models will be created if "values" is
   * an array.
   *
   * @param modelName The name of the model to create
   * @param values The model's values
   * @param options to pass to sequelize
   * @return Promise
   */
  create(modelName, values, options) {
    const Model = this.app.orm[modelName] || this.app.packs.sequelize.orm[modelName]
    const modelOptions = _.defaultsDeep({}, options, _.get(this.config, 'footprints.models.options'))
    if (!Model) {
      return Promise.reject(new ModelError('E_NOT_FOUND', `${modelName} can't be found`))
    }
    if (modelOptions.populate) {
      modelOptions.include = modelOptions.populate === true ? {all: true} : this._createIncludeField(Model, modelOptions.populate)
    }
    return Model.create(values, modelOptions).catch(err => {
      if (err.name == 'SequelizeValidationError') {
        return Promise.reject(new ModelError('E_VALIDATION', err.message, err.errors))
      }
      return Promise.reject(err)
    })
  }

  _createIncludeField(model, options) {
    const fields = options.split(',')
    const includes = []

    fields.forEach((value, key) => {
      includes.push(model.associations[value])
    })

    return includes
  }

  /**
   * Find all models that satisfy the given criteria. If a primary key is given,
   * the return value will be a single Object instead of an Array.
   *
   * @param modelName The name of the model
   * @param criteria The criteria that filter the model resultset
   * @param options to pass to sequelize
   * @return Promise
   */
  find(modelName, criteria, options) {
    const Model = this.app.orm[modelName] || this.app.packs.sequelize.orm[modelName]
    const modelOptions = _.defaultsDeep({}, options, _.get(this.config, 'footprints.models.options'))
    let query
    if (!Model) {
      return Promise.reject(new ModelError('E_NOT_FOUND', `${modelName} can't be found`))
    }
    if (modelOptions.populate) {
      modelOptions.include = modelOptions.populate === true ? {all: true} : this._createIncludeField(Model, modelOptions.populate)
    }
    delete modelOptions.populate

    if (!_.isPlainObject(criteria) || modelOptions.findOne === true) {
      if (modelOptions.findOne === true) {
        criteria = {where: criteria}
        query = Model.find(_.defaults(criteria, modelOptions))
      }
      else {
        query = Model.find(_.defaults({
          where: {
            [Model.primaryKeyAttribute]: criteria
          }
        }, modelOptions))
      }
    }
    else {
      criteria = {where: criteria}
      query = Model.findAll(_.defaults(criteria, modelOptions))
    }

    return query.catch(err => {
      if (err.name == 'SequelizeValidationError') {
        return Promise.reject(new ModelError('E_VALIDATION', err.message, err.errors))
      }
      return Promise.reject(err)
    })
  }

  /**
   * Update an existing model, or models, matched by the given by criteria, with
   * the given values. If the criteria given is the primary key, then return
   * exactly the object that is updated; otherwise, return an array of objects.
   *
   * @param modelName The name of the model
   * @param criteria The criteria that determine which models are to be updated   *
   * @param [id] A optional model id; overrides "criteria" if both are specified.
   * @param values to update
   * @param options no used yet for sequelize
   * @return Promise
   */
  update(modelName, criteria, values, options) {
    const Model = this.app.orm[modelName] || this.app.packs.sequelize.orm[modelName]
    //const modelOptions = _.defaultsDeep({}, options, _.get(this.config, 'footprints.models.options'))
    if (!Model) {
      return Promise.reject(new ModelError('E_NOT_FOUND', `${modelName} can't be found`))
    }
    let query
    if (!criteria) {
      criteria = {}
    }

    if (_.isPlainObject(criteria)) {
      criteria = {where: criteria}
      query = Model.update(values, criteria)
    }
    else {
      query = Model.update(values, {
        where: {
          [Model.primaryKeyAttribute]: criteria
        }
      }).then(results => results[0])
    }

    return query.catch(err => {
      if (err.name == 'SequelizeValidationError') {
        return Promise.reject(new ModelError('E_VALIDATION', err.message, err.errors))
      }
      return Promise.reject(err)
    })
  }

  /*
   * Destroy (delete) the model, or models, that match the given criteria.
   *
   * @param modelName The name of the model
   * @param criteria The criteria that determine which models are to be updated
   * @return Promise
   */
  destroy(modelName, criteria, options) {
    const Model = this.app.orm[modelName] || this.app.packs.sequelize.orm[modelName]
    let query
    if (!Model) {
      return Promise.reject(new ModelError('E_NOT_FOUND', `${modelName} can't be found`))
    }
    if (_.isPlainObject(criteria)) {
      criteria = {where: criteria}
      query = Model.destroy(criteria)
    }
    else {
      query = Model.destroy({
        where: {
          [Model.primaryKeyAttribute]: criteria
        }
      }).then(results => results[0])
    }

    return query.catch(err => {
      if (err.name == 'SequelizeValidationError') {
        return Promise.reject(new ModelError('E_VALIDATION', err.message, err.errors))
      }
      return Promise.reject(err)
    })
  }

  /**
   * TODO Create a model, and associate it with its parent model.
   *
   * @param parentModelName The name of the model's parent
   * @param childAttributeName The name of the model to create
   * @param parentId The id (required) of the parent model
   * @param values The model's values
   * @return Promise
   */
  createAssociation(parentModelName, parentId, childAttributeName, values, options) {
    /*
     const parentModel = this.app.orm[parentModelName] || this.app.packs.sequelize.orm[parentModelName]
     const childAttribute = parentModel.associations[childAttributeName]
     const childModelName = childAttribute.target.name

     values[childAttribute.foreignKey] = parentId

     return this.create(childModelName, values, options)
     */
    return Promise.reject('trailpack-sequelize does not have createAssociation support yet. Sorry')
  }

  /**
   * TODO Find all models that satisfy the given criteria, and which is associated
   * with the given Parent Model.
   *
   * @param parentModelName The name of the model's parent
   * @param childAttributeName The name of the model to create
   * @param parentId The id (required) of the parent model
   * @param criteria The search criteria
   * @return Promise
   */
  findAssociation(parentModelName, parentId, childAttributeName, criteria, options) {
    /*
     const parentModel = this.app.orm[parentModelName] || this.app.packs.sequelize.orm[parentModelName]
     const childAttribute = parentModel.associations[childAttributeName]
     const childModelName = childAttribute.target.name

     if (!criteria.where && _.isPlainObject(criteria)) {
     criteria.where = {}
     }
     if (!options) {
     options = {}
     }
     //TODO check every associations
     criteria.where[childAttribute.foreignKey] = parentId
     return this.find(childModelName, criteria, options)
     */
    return Promise.reject('trailpack-sequelize does not have findAssociation support yet. Sorry')
  }

  /**
   * TODO Update models by criteria, and which is associated with the given
   * Parent Model.
   *
   * @param parentModelName The name of the model's parent
   * @param parentId The id (required) of the parent model
   * @param childAttributeName The name of the model to create
   * @param criteria The search criteria
   * @return Promise
   */
  updateAssociation(parentModelName, parentId, childAttributeName, criteria, values, options) {
    /*
     const parentModel = this.app.orm[parentModelName] || this.app.packs.sequelize.orm[parentModelName]
     const childAttribute = parentModel.associations[childAttributeName]
     const childModelName = childAttribute.target.name
     const childModel = this.app.orm[childModelName] || this.app.packs.sequelize.orm[childModelName]

     if (!criteria.where && _.isPlainObject(criteria)) {
     criteria.where = {}
     }
     //TODO check every associations
     if (!_.isPlainObject(criteria)) {
     criteria = {
     where: {
     [childModel.primaryKeyAttribute]: criteria
     }
     }
     options = _.defaults({findOne: true}, options)
     }

     return this.update(childModelName, criteria, values, options)
     */
    return Promise.reject('trailpack-sequelize does not have updateAssociation support yet. Sorry')
  }

  /**
   * TODO Destroy models by criteria, and which is associated with the
   * given Parent Model.
   *
   * @param parentModelName The name of the model's parent
   * @param parentId The id (required) of the parent model
   * @param childAttributeName The name of the model to create
   * @param criteria The search criteria
   * @return Promise
   */
  destroyAssociation(parentModelName, parentId, childAttributeName, criteria, options) {
    /*
     const parentModel = this.app.orm[parentModelName] || this.app.packs.sequelize.orm[parentModelName]
     const childAttribute = parentModel.associations[childAttributeName]
     const childModelName = childAttribute.target.name
     const childModel = this.app.orm[childModelName] || this.app.packs.sequelize.orm[childModelName]

     if (!_.isPlainObject(criteria)) {
     criteria = {
     [childModel.primaryKey]: criteria
     }
     }
     //TODO check every associations
     // query within the "many" side of the association
     if (childAttribute.via) {
     const mergedCriteria = _.extend({[childAttribute.via]: parentId}, criteria)
     return this.destroy(childModelName, mergedCriteria, options)
     .then(records => {
     return _.map(records, record => {
     return {
     [childModel.primaryKey]: record[childModel.primaryKey]
     }
     })
     })
     }
     // query the "one" side of the association
     return this
     .findAssociation(parentModelName, parentId, childAttributeName, criteria, options)
     .then(record => {
     return this.destroy(childModelName, record[childModel.primaryKey])
     })
     .then(destroyedRecord => {
     return {
     [childModel.primaryKey]: destroyedRecord[childModel.primaryKey]
     }
     })
     */
    return Promise.reject('trailpack-sequelize does not have destroyAssociation support yet. Sorry')
  }
}
