# trailpack-sequelize
:package: Sequelize.js Trailpack http://sequelizejs.com

[![Gitter][gitter-image]][gitter-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]


Loads Application Models (in `api/models`) into the Sequelize ORM; Integrates with [trailpack-router](https://github.com/trailsjs/trailpack-router) to
generate Footprints for routes.

## Usage

### Configure

```js
// config/main.js
module.exports = {
  // ...
  packs: [
    require('trailpack-sequelize')
  ]
}
```

A basic `config/database.js` can be found here : https://github.com/trailsjs/trailpack-sequelize/blob/master/archetype/config/database.js

### Models

```js
module.exports = class User extends Model {
  //More about supported schema here : http://docs.sequelizejs.com/en/latest/docs/models-definition/
  static schema (app, Sequelize) {
    return {
       name: { type: Sequelize.STRING, allowNull: false },
       password: Sequelize.STRING,
       displayName: Sequelize.STRING
     }
  }

  static config (app, Sequelize) {
    return {
       migrate: 'drop', //override default models configurations if needed
       store: 'sqlite', //override default models configurations if needed
       //More informations about supported models options here : http://docs.sequelizejs.com/en/latest/docs/models-definition/#configuration
       options: {
         classMethods: {
           //If you need associations, put them here
           associate: (models) => {
             //More information about associations here : http://docs.sequelizejs.com/en/latest/docs/associations/
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
}
```

### Query

```js
// api/services/UserService.js
module.exports = class UserService extends Service {
  /**
   * Finds people with the given email.
   * @return Promise
   * @example {
   *    name: 'Ludwig Beethoven',
   *    email: 'someemail@email.com',
   *    favoriteColors: [
   *      { name: 'yellow', hex: 'ffff00' },
   *      { name: 'black', hex: '000000' }
   *     ]
   * }
   */
  findUser (email) {
    //More info about queries here : http://docs.sequelizejs.com/en/latest/docs/models-usage/
    return this.app.orm.User.find({ where: {email: email} })
  }
}
```
For more informations about sequelize queries, please look at [the official documentation](http://docs.sequelizejs.com/en/latest/docs/querying/)

## Footprints query options
Some options can be provide as query param for the `find` method, example `GET /api/v1/user`.

### Populate 
You can add `/api/v1/user?populate=all` to populate all associations or use `/api/v1/user?populate=field1,field2` to populate only some association.

### Pagination
By settings `offset` and `limit` you can do some pagination, example `/api/v1/user?offset=10&limit=10` will return only 10 items started from 10 (id 10 to 20). 

## Contributing
We love contributions! Please check out our [Contributor's Guide](https://github.com/trailsjs/trails/blob/master/CONTRIBUTING.md) for more
information on how our projects are organized and how to get started.


## License
[MIT](https://github.com/trailsjs/trailpack-sequelize/blob/master/LICENSE)

## Changelog
[Changelog](https://github.com/trailsjs/trailpack-sequelize/blob/master/CHANGELOG.md)

[snyk-image]: https://snyk.io/test/github/trailsjs/trailpack-sequelize/badge.svg
[snyk-url]: https://snyk.io/test/github/trailsjs/trailpack-sequelize
[npm-image]: https://img.shields.io/npm/v/trailpack-sequelize.svg?style=flat-square
[npm-url]: https://npmjs.org/package/trailpack-sequelize
[ci-image]: https://img.shields.io/travis/trailsjs/trailpack-sequelize/master.svg?style=flat-square
[ci-url]: https://travis-ci.org/trailsjs/trailpack-sequelize
[daviddm-image]: http://img.shields.io/david/trailsjs/trailpack-sequelize.svg?style=flat-square
[daviddm-url]: https://david-dm.org/trailsjs/trailpack-sequelize
[codeclimate-image]: https://img.shields.io/codeclimate/github/trailsjs/trailpack-sequelize.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/trailsjs/trailpack-sequelize
[gitter-image]: http://img.shields.io/badge/+%20GITTER-JOIN%20CHAT%20%E2%86%92-1DCE73.svg?style=flat-square
[gitter-url]: https://gitter.im/trailsjs/trails
