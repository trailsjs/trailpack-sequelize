/**
 * Models Configuration
 *
 * @see {@link http://trailsjs.io/doc/trailpack/config
 */
module.exports = {
  /**
   * The default store if not defined by model
   */
  defaultStore: 'sqlitedev',
  /**
   * The default migration strategy if not defined by the store or model
   * ENUM: none, safe, drop, alter,
   */
  migrate: 'drop'

  /**
   * You can also define model by model which store, migration, etc it will use.
   * A la carte model definitions
   * eg:
   *
   * Test: {
   *   store: 'sqlitedev',
   *   migrate: 'drop',
   *   tableName: 'test',
   *   options: {}
   * }
   */
}
