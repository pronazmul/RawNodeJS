/*
 * Title : Request Response Handler Function
 * Description: Function Will Parse All Request Data
 * Author: Nazmul Huda
 * Date : 18/04/2022
 */

//Dependencies
const url = require('url')
const routes = require('../routes')
const { notFoundHanler } = require('../handlers/routeHandlers/notFoundHandler')
const { StringDecoder } = require('string_decoder')
const { jsonStringToObject } = require('./utilities')

// Module Scaffolding
const handler = {}

handler.handleReqRes = (req, res) => {
  // Parse Request URL
  const parsedUrl = url.parse(req.url, true)
  // Get Path
  const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '')
  // Get Query String
  const query = parsedUrl.query
  // Get HTTP Method to Lower Case
  const method = req.method.toLowerCase()
  // Get Headers
  const headers = req.headers

  //Chose Desired Handler By URL Path
  const chosedHandler = routes[path] ? routes[path] : notFoundHanler

  // Get Payload & Decode
  const decoder = new StringDecoder('utf-8')
  let body = ''

  // Listen Data Event on Request
  req.on('data', (buffer) => {
    body += decoder.write(buffer)
  })
  // Listen End Event on Request
  req.on('end', () => {
    body += decoder.end()

    // Utility Fucntion To Parse JSON String to Object
    const requestBody = jsonStringToObject(body)

    // All Req Object together
    const requestObject = {
      path,
      query,
      method,
      headers,
      body: requestBody,
    }

    // Invode Desired Handler
    chosedHandler(requestObject, (statusCode, payload) => {
      let code = typeof statusCode === 'number' ? statusCode : 500
      let data = typeof payload === 'object' ? payload : {}

      res.writeHead(code, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(data))
    })
  })
}

// Module Export
module.exports = handler
