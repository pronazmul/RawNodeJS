/*
 * Title : Utilities - Helper
 * Description: Utility Functions for Application.
 * Author: Nazmul Huda
 * Date : 20/04/2022
 */

//Dependencies
const crypto = require('crypto')
const environment = require('./environments')

// Module Scaffolding:
const utilities = {}

utilities.jsonStringToObject = (jsonString) => {
  let object
  try {
    object = JSON.parse(jsonString)
  } catch (error) {
    object = {}
  }
  return object
}

utilities.makeHash = (str) => {
  let pwd
  try {
    pwd = crypto
      .createHmac('sha256', environment.secretKey)
      .update(str)
      .digest('hex')
  } catch (error) {
    pwd = false
  }
  return pwd
}

// Module Export:
module.exports = utilities
