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

utilities.randomStringGenerator = (strLength) => {
  if (strLength && strLength > 0) {
    let randomStr =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let randomString = ''
    for (let i = 0; i < strLength; i++) {
      randomString += randomStr.charAt(
        Math.floor(Math.random() * randomStr.length)
      )
    }
    return randomString
  } else {
    return false
  }
}

utilities.randomStringGenerator(20)

// Module Export:
module.exports = utilities
