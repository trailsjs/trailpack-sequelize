'use strict'
module.exports = class ModelError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
    this.name = 'Model error'
  }
}
