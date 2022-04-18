/*
* Title: Raw Node Uptime Monitoring Application.
* Description: User Can Create Accouts, Store Api Endpoints, and Monitor Uptime. Notified by SMS.
* Author: Nazmul Huda
* Date: 18/04/2022
*/

// Dependencies
const http = require('http');
const url = require('url');
const {StringDecoder} = require('string_decoder');

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
app.handleRequestResponse = (req, res)=> {
    // Parse Request URL
    const parsedUrl = url.parse(req.url, true);
    // Get Path
    const path = (parsedUrl.pathname).replace(/^\/+|\/+$/g, '');
    // Get Query String
    const queryStringObject = parsedUrl.query;
    // Get HTTP Method
    const method = req.method.toLowerCase();
    // Get Headers
    const headers = req.headers;
    // Get Payload & Decode
    const decoder = new StringDecoder('utf-8');
    let body = '';

    // Listen Data Event on Request
    req.on('data', (buffer)=> {
        body += decoder.write(buffer);
    })
    // Listen End Event on Request
    req.on('end', ()=> {
        body += decoder.end();
        // Make Request Body to Json
        const json = JSON.parse(body.replace(/\r\n/g,''))
        console.log({json, body, path, queryStringObject, method, headers})
        res.end("Hello World")
    })
}


// Start Server
app.createServer(app.handleRequestResponse);

