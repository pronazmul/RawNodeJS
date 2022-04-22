/*
 * Title: Initialize Server
 * Description: Application Main Server Initialization File.
 * Author: Nazmul Huda
 * Date: 22/04/2022
 */

// Dependencies
const http = require('http')
const { handleReqRes } = require('../helper/handleReqRes')
const environment = require('../helper/environments')

// Module Scaffolding
const server = {}

// Create Server
server.createServer = (callback) => {
  // Create Server
  const app = http.createServer(callback)
  // listen To Port
  app.listen(environment.port, () => {
    console.log(`Server is listening on port ${environment.port}`)
  })
}

// REQUEST RESPONSE HANDLR FUNCTION
server.handleRequestResponse = handleReqRes

// RUN THE SERVER
server.init = () => {
  server.createServer(server.handleRequestResponse)
}

// MODULE EXPORT
module.exports = server
