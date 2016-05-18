'use strict'

const assert = require('assert')

describe('api.services.FootprintService', () => {
  let FootprintService
  before(() => {
    FootprintService = global.app.services.FootprintService
  })
  describe('#create', () => {
    it('should insert a record', () => {
      return FootprintService.create('Role', {name: 'createtest'})
        .then(role => {
          assert.equal(role.name, 'createtest')
        })
    })
    it('should insert a record with child', () => {
      return FootprintService.create('User', {name: 'userTest', roles: [{name: 'roleTest'}]}, {populate: 'roles'})
        .then(user => {
          assert.equal(user.name, 'userTest')
          assert.equal(user.roles.length, 1)
          assert.equal(user.roles[0].name, 'roleTest')
        })
    })
    it('should return a not found error', () => {
      return FootprintService.create('UnknowModel', {name: 'userTest'})
        .catch(err => {
          assert.equal(err.code, 'E_NOT_FOUND')
          assert.equal(err.message, 'UnknowModel can\'t be found')
          assert.equal(err.name, 'Model error')
        })
    })
    it('should return a validation error', () => {
      return FootprintService.create('User', {roles: [{name: 'roleTest'}]}, {populate: 'roles'})
        .catch(err => {
          assert.equal(err.code, 'E_VALIDATION')
          assert.equal(err.message, 'notNull Violation: name cannot be null')
          assert.equal(err.errors[0].path, 'name')
          assert.equal(err.errors[0].message, 'name cannot be null')
          assert.equal(err.errors[0].type, 'notNull Violation')
          assert.equal(err.name, 'Model error')
        })
    })
  })
  describe('#find', () => {
    it('should find a single record', () => {
      return FootprintService.create('Role', {name: 'findtest'})
        .then(role => {
          assert.equal(role.name, 'findtest')
          assert(role.id)
          return FootprintService.find('Role', role.id)
        })
        .then(role => {
          assert(!role.length)
          assert.equal(role.dataValues.name, 'findtest')
        })
    })
    it('should find a set of records', () => {
      return FootprintService.create('Role', {name: 'findtest'})
        .then(role => {
          assert.equal(role.name, 'findtest')
          assert(role.id)
          return FootprintService.find('Role', {name: 'findtest'})
        })
        .then(roles => {
          assert(roles[0])
          //assert.equal(roles.length, 1)
          assert.equal(roles[0].name, 'findtest')
        })
    })

    it('should return a not found error', () => {
      return FootprintService.find('UnknowModel', {name: 'findtest'})
        .catch(err => {
          assert.equal(err.code, 'E_NOT_FOUND')
          assert.equal(err.message, 'UnknowModel can\'t be found')
          assert.equal(err.name, 'Model error')
        })
    })
  })
  describe('#update', () => {
    it('should update a set of records', () => {
      return FootprintService.create('Role', {name: 'updatetest'})
        .then(role => {
          assert.equal(role.name, 'updatetest')
          assert(role.id)
          return FootprintService.update(
            'Role',
            {name: 'updatetest'},
            {name: 'updated'}
          )
        })
        .then(results => {
          assert(results[0])
          assert.equal(results[0], 1)
        })
    })
    it('should return a not found error', () => {
      return FootprintService.update(
        'UnknowModel',
        {name: 'updatetest'},
        {name: 'updated'}
        )
        .catch(err => {
          assert.equal(err.code, 'E_NOT_FOUND')
          assert.equal(err.message, 'UnknowModel can\'t be found')
          assert.equal(err.name, 'Model error')
        })
    })
  })
  describe('#destroy', () => {
    it('should delete a set of records', () => {
      return FootprintService.create('Role', {name: 'destroytest'})
        .then(role => {
          assert.equal(role.name, 'destroytest')
          assert(role.id)
          return FootprintService.destroy('Role', {name: 'destroytest'})
        })
        .then(nbRowDeleted => {
          assert.equal(nbRowDeleted, 1)
          return FootprintService.find('Role', {name: 'destroytest'})
        })
        .then(roles => {
          assert.equal(roles.length, 0)
        })
    })

    it('should return a not found error', () => {
      return FootprintService.destroy('UnknowModel', {name: 'destroy'})
        .catch(err => {
          assert.equal(err.code, 'E_NOT_FOUND')
          assert.equal(err.message, 'UnknowModel can\'t be found')
          assert.equal(err.name, 'Model error')
        })
    })
  })
  describe('#createAssociation', () => {
    it.skip('TODO should insert an associated record', () => {
      let userId
      return FootprintService.create('User', {name: 'createassociationtest'})
        .then(user => {
          assert(user)
          assert(user.id)
          userId = user.id
          return FootprintService.createAssociation('User', user.id, 'roles', {
            name: 'createassociatedrole'
          })
        })
        .then(role => {
          assert(role)
          assert(role.id)
          return FootprintService.find('User', userId)
        })
        .then(user => {
          assert(user[0])
          assert.equal(user[0].roles.length, 1)
          assert.equal(user[0].roles[0].name, 'createassociatedrole')
        })

    })
  })
  describe('#findAssociation', () => {
    it.skip('TODO should find an associated record', () => {
      let userId
      return FootprintService.create('User', {name: 'findassociationtest'})
        .then(user => {
          assert(user)
          assert(user.id)
          userId = user.id
          return FootprintService.createAssociation('User', user.id, 'roles', {
            name: 'findassociatedrole'
          })
        })
        .then(role => {
          assert(role)
          assert(role.id)
          return FootprintService.findAssociation('User', userId, 'roles')
        })
        .then(roles => {
          assert(roles)
          assert(roles[0])
          assert.equal(roles[0].User.name, 'findassociationtest')
        })

    })
  })
  describe('#updateAssociation', () => {
    it.skip('TODO should update an associated record', () => {
      let userId
      return FootprintService.create('User', {name: 'updateassociationtest'})
        .then(user => {
          assert(user)
          assert(user.id)
          userId = user.id
          return FootprintService.createAssociation('User', user.id, 'roles', {
            name: 'findassociatedrole'
          })
        })
        .then(role => {
          assert(role)
          assert(role.id)
          return FootprintService.updateAssociation(
            'User',
            userId,
            'roles',
            {user: userId},
            {name: 'updateassociatedrole'}
          )
        })
        .then(roles => {
          assert(roles[0])
          return FootprintService.find('Role', roles[0])
        }).then(role => {
          assert.equal(role.name, 'updateassociatedrole')
        })
    })
  })
  describe('#destroyAssociation', () => {
    it.skip('TODO should delete an associated record', () => {
      let userId
      return FootprintService.create('User', {name: 'destroyassociationtest'})
        .then(user => {
          assert(user)
          assert(user.id)
          userId = user.id
          return FootprintService.createAssociation('User', user.id, 'roles', {
            name: 'findassociatedrole'
          })
        })
        .then(role => {
          assert(role)
          assert(role.id)
          return FootprintService.destroyAssociation('User', userId, 'roles', role.id)
        })
        .then(roles => {
          assert(roles)
          return FootprintService.find('User', userId, {populate: [{attribute: 'roles'}]})
        })
        .then(user => {
          assert.equal(user.roles.length, 0)
        })
    })
  })
})
