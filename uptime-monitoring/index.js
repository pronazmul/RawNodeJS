/*
 * Title: Root Initialization File.
 * Description: Initialize Two Process one is Server and another is Worker.
 * Author: Nazmul Huda
 * Date: 21/04/2022
 */

// Dependencies
const server = require('./lib/server')
const worker = require('./lib/worker')

// Module Scaffolding
const app = {}

// Initialize Server and Wroker
app.init = () => {
  // start the Server
  server.init()
  // Start the worker
  worker.init()
}

// Run Server and worker together.
app.init()

// Export Module
module.exports = app
