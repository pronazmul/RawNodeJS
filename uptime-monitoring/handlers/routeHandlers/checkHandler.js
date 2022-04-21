/*
 * Title: Check Handler
 * Description: Handle All User Defined Checks.
 * Author: Nazmul Huda
 * Date: 21/04/2022
 */
// Dependencies

const db = require('../../lib/data')
const {
  jsonStringToObject,
  randomStringGenerator,
} = require('../../helper/utilities')
const { tokenVerifier } = require('./tokenHandler')

// Module Scaffolding
const handlr = {}

handlr.checkHandler = (requestProperties, callback) => {
  const allwedMethods = ['get', 'post', 'put', 'delete']
  if (allwedMethods.includes(requestProperties.method)) {
    handlr._check[requestProperties.method](requestProperties, callback)
  } else {
    callback(405, {
      message: 'Your requested not allowed!',
    })
  }
}
handlr._check = {}

handlr._check.get = (requestObject, callback) => {
  // Lookup the check by id
  let id = requestObject.query.id ? requestObject.query.id : false
  if (id) {
    db.read('checks', id, (err, data) => {
      if (!err && data) {
        let check = jsonStringToObject(data)
        // Verify Token
        let token = requestObject.headers.token
          ? requestObject.headers.token
          : false
        tokenVerifier(token, check.userPhone, (verified) => {
          if (verified) {
            callback(200, check)
          } else {
            callback(403, { error: 'Authentication Failed' })
          }
        })
      } else {
        callback(404, { error: 'Check Not Found' })
      }
    })
  } else {
    callback(400, { error: 'There was a Problem in your request!' })
  }
}
handlr._check.post = (requestObject, callback) => {
  let { protocol, url, method, successCodes, timeoutSecond } =
    requestObject.body

  protocol = protocol && typeof protocol === 'string' ? protocol.trim() : false
  url = url && typeof url === 'string' ? url.trim() : false
  method = method && typeof method === 'string' ? method.trim() : false
  successCodes =
    successCodes && Array.isArray(successCodes) ? successCodes : false
  timeoutSecond =
    timeoutSecond &&
    typeof timeoutSecond === 'number' &&
    timeoutSecond >= 1 &&
    timeoutSecond <= 5
      ? timeoutSecond
      : false

  if (protocol && url && method && successCodes && timeoutSecond) {
    //   Lookupthe users phone by token & verify
    let token = requestObject.headers.token
      ? requestObject.headers.token
      : false
    db.read('tokens', token, (err, data) => {
      if (!err && data) {
        let { phone, expires } = jsonStringToObject(data)
        if (phone && expires > Date.now()) {
          // Lookup the user Info by phone
          db.read('users', phone, (err, data) => {
            if (!err && data) {
              let userData = jsonStringToObject(data)
              let { checks = [] } = userData
              let checkId = randomStringGenerator(20)
              if (checks.length < 5) {
                // Create a new check
                let checkObject = {
                  id: checkId,
                  userPhone: phone,
                  protocol,
                  url,
                  method,
                  successCodes,
                  timeoutSecond,
                }
                db.create('checks', checkId, checkObject, (err) => {
                  if (!err) {
                    //   Add the check to the user's object
                    userData.checks = [...checks, checkId]
                    db.update('users', phone, userData, (err) => {
                      if (!err) {
                        callback(200, checkObject)
                      } else {
                        callback(500, { error: 'Failed to update user' })
                      }
                    })
                  } else {
                    callback(500, { error: 'Failed To Create Check' })
                  }
                })
              } else {
                callback(400, { error: 'Already used your check limit!' })
              }
            } else {
              callback(404, { error: 'Requested User Not Found' })
            }
          })
        } else {
          callback(403, { error: 'Authentication Failed' })
        }
      } else {
        callback(403, { error: 'Authentication Failed' })
      }
    })
  } else {
    callback(400, { error: 'Problem in your request!' })
  }
}
handlr._check.put = (requestObject, callback) => {
  let token = requestObject.headers.token ? requestObject.headers.token : false
  let { id, protocol, url, method, successCodes, timeoutSecond } =
    requestObject.body
  id = id ? id : false
  protocol = protocol && typeof protocol === 'string' ? protocol.trim() : false
  url = url && typeof url === 'string' ? url.trim() : false
  method = method && typeof method === 'string' ? method.trim() : false
  successCodes =
    successCodes && Array.isArray(successCodes) ? successCodes : false
  timeoutSecond =
    timeoutSecond &&
    typeof timeoutSecond === 'number' &&
    timeoutSecond >= 1 &&
    timeoutSecond <= 5
      ? timeoutSecond
      : false

  if (
    id &&
    token &&
    (protocol || url || method || successCodes || timeoutSecond)
  ) {
    //Lookup the check
    db.read('checks', id, (err, data) => {
      if (!err && data) {
        let check = jsonStringToObject(data)
        //Verify Token
        tokenVerifier(token, check.userPhone, (verified) => {
          if (verified) {
            //Update the check
            check.protocol = protocol ? protocol : check.protocol
            check.url = url ? url : check.url
            check.method = method ? method : check.method
            check.successCodes = successCodes
              ? successCodes
              : check.successCodes
            check.timeoutSecond = timeoutSecond
              ? timeoutSecond
              : check.timeoutSecond

            db.update('checks', id, check, (err) => {
              if (!err) {
                callback(200, check)
              } else {
                callback(500, { error: 'Failed to update check' })
              }
            })
          } else {
            callback(403, { error: 'Authentication Failed' })
          }
        })
      } else {
        callback(403, { error: 'Authentication Failed!' })
      }
    })
  } else {
    callback(400, { error: 'There was a Problem in your request!' })
  }
}
handlr._check.delete = (requestObject, callback) => {
  let token = requestObject.headers.token ? requestObject.headers.token : false
  let id = requestObject.query.id ? requestObject.query.id : false
  // Lookup the check by id
  if (id) {
    db.read('checks', id, (err, data) => {
      if (!err && data) {
        let check = jsonStringToObject(data)
        // Verify Token
        tokenVerifier(token, check.userPhone, (verified) => {
          if (verified) {
            // Delete Check
            db.delete('checks', id, (err) => {
              if (!err) {
                // Delete the check from the user's object
                db.read('users', check.userPhone, (err, data) => {
                  if (!err && data) {
                    let userData = jsonStringToObject(data)
                    let { checks = [] } = userData
                    // Remove the check from the user's object
                    userData.checks = checks.filter((checkId) => checkId !== id)
                    db.update('users', check.userPhone, userData, (err) => {
                      if (!err) {
                        callback(200, { success: 'Check Deleted' })
                      } else {
                        callback(500, { error: 'Failed to update user' })
                      }
                    })
                  } else {
                    callback(500, { error: 'Failed to delete check' })
                  }
                })
              } else {
                callback(500, { error: 'Failed to delete check' })
              }
            })
          } else {
            callback(403, { error: 'Authentication Failed' })
          }
        })
      } else {
        callback(404, { error: 'Check Not Found' })
      }
    })
  } else {
    callback(400, { error: 'There was a Problem in your request!' })
  }
}

module.exports = handlr
