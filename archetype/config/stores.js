/**
 * Stores Configuration
 *
 * @see {@link http://trailsjs.io/doc/trailpack/config
 */
module.exports = {
  /**
   * Define the database stores. A store is typically a single database.
   *
   * Use the SQLite3 by default for development purposes.
   *
   * Set production connection info in config/env/production.js
   */


  /**
   * Define a store called "sqlitedev" which uses SQLite3 to persist data.
   */
  sqlitedev: {
    database: 'dev',
    storage: './.tmp/dev.sqlite',
    host: '127.0.0.1',
    dialect: 'sqlite'
    /**
     * The default migration strategy for this store.
     migrate: 'drop'
    */
  }
}
