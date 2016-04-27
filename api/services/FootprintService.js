'use strict'

const _ = require('lodash')
const Service = require('trails-service')

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
   * @return Promise
   */
  create(modelName, values, options) {
    const Model = this.app.orm[modelName] || this.app.packs.sequelize.orm[modelName]

    return Model.create(values, options)
  }

  /**
   * Find all models that satisfy the given criteria. If a primary key is given,
   * the return value will be a single Object instead of an Array.
   *
   * @param modelName The name of the model
   * @param criteria The criteria that filter the model resultset
   * @return Promise
   */
  find(modelName, criteria, options) {
    const Model = this.app.orm[modelName] || this.app.packs.sequelize.orm[modelName]
    const modelOptions = _.defaultsDeep({}, options, _.get(this.config, 'footprints.models.options'))
    let query

    if (!options) {
      options = {}
    }
    if (!_.isPlainObject(criteria) || options.findOne === true) {
      if (options.findOne === true) {
        query = Model.find(criteria)
      }
      else {
        query = Model.findById(criteria)
      }

    }
    else {
      if (modelOptions.defaultLimit) {
        query = Model.findAll(_.defaults(criteria, {
          limit: modelOptions.defaultLimit
        }))
      }
      else {
        query = Model.findAll(criteria)
      }
    }

    return query
  }

  /**
   * Update an existing model, or models, matched by the given by criteria, with
   * the given values. If the criteria given is the primary key, then return
   * exactly the object that is updated; otherwise, return an array of objects.
   *
   * @param modelName The name of the model
   * @param criteria The criteria that determine which models are to be updated
   * @param [id] A optional model id; overrides "criteria" if both are specified.
   * @return Promise
   */
  update(modelName, criteria, values, options) {
    const Model = this.app.orm[modelName] || this.app.packs.sequelize.orm[modelName]
    const modelOptions = _.defaultsDeep({}, options, _.get(this.config, 'footprints.models.options'))
    let query
    if (!criteria) {
      criteria = {}
    }

    if (_.isPlainObject(criteria)) {
      if (!criteria.where) {
        criteria.where = {}
      }
      if (modelOptions.defaultLimit) {
        query = Model.update(values, _.defaults(criteria, {
          limit: modelOptions.defaultLimit
        }))
      }
      else {
        query = Model.update(values, criteria)
      }
    }
    else {
      query = Model.update(values, {
        where: {
          [Model.primaryKey]: criteria
        }
      }).then(results => results[0])
    }

    return query
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

    if (_.isPlainObject(criteria)) {
      query = Model.destroy(criteria)
    }
    else {
      query = Model.destroy({
        where: {
          [Model.primaryKey]: criteria
        }
      }).then(results => results[0])
    }

    return query
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
    const parentModel = this.app.orm[parentModelName] || this.app.packs.sequelize.orm[parentModelName]
    const childAttribute = parentModel.associations[childAttributeName]
    const childModelName = childAttribute.target.name

    values[childAttribute.foreignKey] = parentId

    return this.create(childModelName, values, options)
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
  }
}
