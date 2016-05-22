'use strict'

const _ = require('lodash')
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
          return {
            options: {
              classMethods: {
                associate: (models) => {
                  models.User.hasMany(models.Role, {
                    as: 'roles',
                    onDelete: 'CASCADE',
                    foreignKey: {
                      allowNull: true
                    }
                  })
                }
              }
            }
          }
        }

        static schema(app, Sequelize) {
          return {
            name: { type: Sequelize.STRING, allowNull: false},
            password: Sequelize.STRING,
            displayName: Sequelize.STRING
          }
        }
      },
      Role: class Role extends Model {
        static config() {
          return {
            store: 'storeoverride',
            options: {
              classMethods: {
                associate: function (models) {
                  models.Role.belongsTo(models.User, {
                    onDelete: 'CASCADE',
                    foreignKey: {
                      allowNull: true
                    }
                  })
                }
              }
            }
          }
        }

        static schema(app, Sequelize) {
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
                    values.beforeCreate += 1
                },
                afterCreate: (values, options) => {
                  if (values.dataValues.afterCreate === 0)
                    values.afterCreate += 1
                },
                beforeBulkUpdate: (values)=> {
                  if (values.attributes.beforeUpdate === 0)
                    values.attributes.beforeUpdate += 1
                },
                afterBulkUpdate: (values)=> {
                  if (values.attributes.afterUpdate === 0)
                    values.attributes.afterUpdate += 1
                },
                beforeUpdate: (values, options) => {
                  if (values.dataValues.beforeUpdate === 0)
                    values.beforeUpdate += 1
                },
                afterUpdate: (values, options) => {
                  if (values.dataValues.afterUpdate === 0)
                    values.afterUpdate += 1
                },
                beforeValidate: (values, options) => {
                  if (values.dataValues.beforeValidate === 0)
                    values.beforeValidate += 1
                },
                afterValidate: (values, options) => {
                  if (values.dataValues.afterValidate === 0)
                    values.afterValidate += 1
                },
                beforeDestroy: (values, options) => {

                },
                afterDestroy: (values, options) => {

                }
              }
            }
          }
        }

        static schema(app, Sequelize) {
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
          dialect: 'sqlite',
          storage: './test/test.sqlite',
          database: 'test'
        },
        storeoverride: {
          host: 'localhost',
          dialect: 'sqlite',
          storage: './test/test.sqlite',
          database: 'test'
        }
      },
      models: {
        defaultStore: 'teststore',
        migrate: 'drop'
      }
    }
  }
}, smokesignals.FailsafeConfig)
