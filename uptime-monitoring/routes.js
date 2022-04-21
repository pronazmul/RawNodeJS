/*
 * Title: Route Handler
 * Description: Application All Route Handler.
 * Author: Nazmul Huda
 * Date: 18/04/2022
 */

// Dependencies
const { userHandler } = require('./handlers/routeHandlers/userHandler')
const { tokenHandler } = require('./handlers/routeHandlers/tokenHandler')
const { checkHandler } = require('./handlers/routeHandlers/checkHandler')

// Module Scaffolding
const routes = {
  user: userHandler,
  token: tokenHandler,
  check: checkHandler,
}

// Export Module
module.exports = routes
