/*
* Title: Raw Node Uptime Monitoring Application.
* Description: User Can Create Accouts, Store Api Endpoints, and Monitor Uptime. Notified by SMS.
* Author: Nazmul Huda
* Date: 18/04/2022
*/

// Dependencies
const http = require('http')
const {handleReqRes} = require('./helper/handleReqRes')

// Module Scaffolding
const app = {};

//  Configuration
app.config = {
    port:5000,
}

// Create Server
app.createServer = (callback)=> {
    // Create Server
    const server = http.createServer(callback);
    // listen To Port
    server.listen(app.config.port, ()=> {
        console.log(`Server is listening on port ${app.config.port}`);
    })
}

// Handle Request Response
app.handleRequestResponse = handleReqRes;

// Start Server
app.createServer(app.handleRequestResponse);

