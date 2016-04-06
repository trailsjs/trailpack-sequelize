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
                  values.dataValues.beforeCreate += 1;
                },
                afterCreate: function (values, options) {
                  values.dataValues.afterCreate += 1;
                },
                beforeUpdate: function (values, options) {
                  values.dataValues.beforeUpdate += 1;
                },
                afterUpdate: function (values, options) {
                  values.dataValues.afterUpdate += 1;
                },
                beforeValidate: function (values, options) {
                  values.dataValues.beforeValidate += 1;
                },
                afterValidate: function (values, options) {
                  values.dataValues.afterValidate += 1;
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
