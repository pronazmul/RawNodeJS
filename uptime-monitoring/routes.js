/*
* Title: Route Handler
* Description: Application All Route Handler. 
* Author: Nazmul Huda
* Date: 18/04/2022
*/

// Dependencies
const {userHandler} = require('./handlers/routeHandlers/userHandler');

const routes = {
user: userHandler,
}

// Export Module
module.exports = routes