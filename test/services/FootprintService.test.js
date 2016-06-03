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
    it('should work for hasOne', () => {
      let projectId
      return FootprintService.create('Project', {name: 'createassociationhasonetest'})
        .then(project => {
          assert(project)
          assert(project.id)
          projectId = project.id
          return FootprintService.createAssociation('Project', project.id, 'Page', {
            name: 'createassociatedpage'
          })
        })
        .then(page => {
          assert(page)
          assert(page.id)
          assert.equal(page.dataValues.ProjectId, projectId)
        })
    })

    it('should work for hasMany', () => {
      let userId
      return FootprintService.create('User', {name: 'createassociationhasmanytest'})
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
          assert.equal(role.dataValues.UserId, userId)
        })
    })

    it('should work for belongsTo', () => {
      return FootprintService.create('Page', {name: 'createassociationbelongstotest'})
        .then(page => {
          assert(page)
          assert(page.id)
          return FootprintService.createAssociation('Page', page.id, 'Owner', {
            name: 'createassociateduser'
          })
          .then(user => {
            return FootprintService.find('Page', page.id)
              .then(page => assert.equal(page.dataValues.OwnerId, user.id))
          })
        })
    })
  })
  describe('#findAssociation', () => {
    it('should work for hasOne', () => {
      let projectId
      return FootprintService.create('Project', {name: 'createassociationhasonetest'})
        .then(project => {
          assert(project)
          assert(project.id)
          projectId = project.id
          return FootprintService.createAssociation('Project', project.id, 'Page', {
            name: 'createassociatedpage'
          })
        })
        .then(page => {
          assert(page)
          assert(page.id)
          assert.equal(page.dataValues.ProjectId, projectId)
          return FootprintService.findAssociation('Project', projectId, 'Page')
        })
        .then(pages => {
          const page = pages[0]
          assert(page)
          assert(page.id)
          assert.equal(page.dataValues.ProjectId, projectId)
        })
    })

    it('should work for hasMany', () => {
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
          const role = roles[0]
          assert(role)
          assert(role.id)
          assert.equal(role.dataValues.UserId, userId)
        })
    })

    it('should work for belongsTo', () => {
      let pageId
      return FootprintService.create('Page', {name: 'findassociationbelongstotest'})
        .then(page => {
          assert(page)
          assert(page.id)
          pageId = page.id
          return FootprintService.createAssociation('Page', page.id, 'Owner', {
            name: 'findassociatedowner'
          })
        })
        .then(owner => {
          assert(owner)
          assert(owner.id)
          return FootprintService.findAssociation('Page', pageId, 'Owner')
            .then(user => assert.equal(user.id, owner.id))
        })
    })

    it('should work for belongsToMany', () => {
      let projectId, userId
      return FootprintService.create('Project', {name: 'findassociationbelongstotest'})
        .then(project => {
          assert(project.id)
          projectId = project.id
          return FootprintService.create('User', {name: 'findassociateduser'})
        })
        .then(user => {
          assert(user.id)
          userId = user.id
          return FootprintService.create('UserProject', {UserId: user.id, ProjectId: projectId})
        })
        .then(userproject => {
          return FootprintService.findAssociation('Project', projectId, 'Users')
            .then(users => assert.equal(users[0].id, userId))
        })
    })
  })
  describe('#updateAssociation', () => {
    it('should work for hasOne', () => {
      let projectId
      return FootprintService.create('Project', {name: 'updateassociationhasonetest'})
        .then(project => {
          assert(project)
          assert(project.id)
          projectId = project.id
          return FootprintService.createAssociation('Project', projectId, 'Page', {
            name: 'findassociatedpage'
          })
        })
        .then(page => {
          assert(page)
          assert(page.id)
          return FootprintService.updateAssociation('Project', projectId, 'Page', {}, {name: 'updateassociatedpage'})
        })
        .then(() => {
          return FootprintService.findAssociation('Project', projectId, 'Page')
        }).then(roles => {
          const role = roles[0]
          assert.equal(role.dataValues.name, 'updateassociatedpage')
        })
    })

    it('should work for hasMany', () => {
      let userId
      return FootprintService.create('User', {name: 'updateassociationhasmanytest'})
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
          return FootprintService.updateAssociation('User', userId, 'roles', {}, {name: 'updateassociatedrole'})
        })
        .then(() => {
          return FootprintService.findAssociation('User', userId, 'roles')
        }).then(roles => {
          const role = roles[0]
          assert.equal(role.dataValues.name, 'updateassociatedrole')
        })
    })

    it('should work for belongsTo', () => {
      let pageId
      return FootprintService.create('Page', {name: 'updateassociationbelongstotest'})
        .then(page => {
          assert(page.id)
          pageId = page.id
          return FootprintService.createAssociation('Page', page.id, 'Owner', {
            name: 'updateassociatedowner'
          })
        })
        .then(user => {
          assert(user.id)
          return FootprintService.updateAssociation('Page', pageId, 'Owner', {}, {name: 'updatedassociatedowner'})
        })
        .then(() => {
          return FootprintService.findAssociation('Page', pageId, 'Owner')
        })
        .then(user => assert.equal(user.dataValues.name, 'updatedassociatedowner'))
    })

    it('should work for belongsToMany', () => {
      let projectId, userId
      return FootprintService.create('Project', {name: 'updatebelongstomanytest'})
        .then(project => {
          assert(project.id)
          projectId = project.id
          return FootprintService.create('User', {name: 'originalassociateduser'})
        })
        .then(user => {
          assert(user.id)
          userId = user.id
          return FootprintService.create('UserProject', {UserId: user.id, ProjectId: projectId})
        })
        .then(userproject => {
          return FootprintService.updateAssociation('Project', projectId, 'Users', {}, {name: 'updatedassociateduser'})
        })
        .then(updated => {
          return FootprintService.findAssociation('Project', projectId, 'Users')
        })
        .then(users => {
          assert.equal(users.length, 1)
          assert.equal(users[0].dataValues.name, 'updatedassociateduser')
        })
    })
  })
  describe('#destroyAssociation', () => {
    it('should delete an associated record', () => {
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
          return FootprintService.find('User', userId, {populate: 'roles'})
        })
        .then(user => {
          assert.equal(user.roles.length, 0)
        })
    })
  })
})
