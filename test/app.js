'use strict'

const _ = require('lodash')
const Sequelize = require('sequelize')
const smokesignals = require('smokesignals')
const Model = require('trails-model')

module.exports = _.defaultsDeep({
  pkg: {
    name: 'sequelize-trailpack-test'
  },
  api: {
    models: {
      User: class User extends Model {
        static config() {
        }

        static schema() {
          return {
            name: Sequelize.STRING,
            password: Sequelize.STRING,
            displayName: Sequelize.STRING/*,
            roles: {
              collection: 'Role',
              via: 'user'
            }*/
          }
        }
      },
      Role: class Role extends Model {
        static config() {
          return {
            store: 'storeoverride',
            options: {}
          }
        }

        static schema() {
          return {
            name: Sequelize.STRING/*,
            user: {
              model: 'User'
            }*/
          }
        }
      },
      ModelCallbacks: class ModelCallbacks extends Model {
        static config() {
          return {
            options: {
              hooks: {
                beforeCreate: (values, options) => {
                  if (values.dataValues.beforeCreate === 0)
                    values.beforeCreate += 1;
                },
                afterCreate: function (values, options) {
                  if (values.dataValues.afterCreate === 0)
                    values.afterCreate += 1;
                },
                beforeUpdate: function (values, options) {
                  if (values.dataValues.beforeUpdate === 0)
                    values.beforeUpdate += 1;
                },
                afterUpdate: function (values, options) {
                  if (values.dataValues.afterUpdate === 0)
                    values.afterUpdate += 1;
                },
                beforeValidate: function (values, options) {
                  if (values.dataValues.beforeValidate === 0)
                    values.beforeValidate += 1;
                },
                afterValidate: function (values, options) {
                  if (values.dataValues.afterValidate === 0)
                    values.afterValidate += 1;
                },
                beforeDestroy: function (values, options) {

                },
                afterDestroy: function (values, options) {

                }
              }
            }
          }
        }

        static schema() {
          return {
            name: Sequelize.STRING,
            beforeCreate: Sequelize.INTEGER,
            afterCreate: Sequelize.INTEGER,
            beforeUpdate: Sequelize.INTEGER,
            afterUpdate: Sequelize.INTEGER,
            beforeValidate: Sequelize.INTEGER,
            afterValidate: Sequelize.INTEGER
          }
        }
      }
    }
  },
  config: {
    main: {
      packs: [
        smokesignals.Trailpack,
        require('trailpack-core'),
        require('../') // trailpack-sequelize
      ]
    },
    database: {
      stores: {
        teststore: {
          host: 'localhost',
          dialect: 'mysql',
          database: 'test',
          pool: {
            max: 5,
            min: 0,
            idle: 10000
          }
        },
        storeoverride: {
          host: 'localhost',
          dialect: 'mysql',
          database: 'test',
          pool: {
            max: 5,
            min: 0,
            idle: 10000
          }
        }
      },
      models: {
        defaultStore: 'teststore',
        migrate: 'drop'
      }
    }
  }
}, smokesignals.FailsafeConfig)
