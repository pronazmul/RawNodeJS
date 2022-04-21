/*
 * Title: Check Handler
 * Description: Handle All User Defined Checks.
 * Author: Nazmul Huda
 * Date: 21/04/2022
 */
// Dependencies

const db = require('../../lib/data')
const {
  makeHash,
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
  let { phone } = requestObject.query
  phone = phone && phone.length === 11 ? phone : false
  if (phone) {
    // Verify Token
    let token = requestObject.headers.token
      ? requestObject.headers.token
      : false
    tokenVerifier(token, phone, (verified) => {
      if (verified) {
        db.read('users', phone, (err, data) => {
          if (!err && data) {
            let user = jsonStringToObject(data)
            delete user.password
            callback(200, user)
          } else {
            callback(404, { error: 'Requested User Not Found' })
          }
        })
      } else {
        callback(403, { error: 'Authentication Failed' })
      }
    })
  } else {
    callback(400, { error: 'Invalid Phone Number' })
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
  let { firstName, lastName, phone, password } = requestObject.body
  firstName = firstName ? firstName.trim() : false
  lastName = lastName ? lastName.trim() : false
  phone = phone && phone.length === 11 ? phone : false
  password = password ? password.trim() : false
  if (phone && (firstName || lastName || password)) {
    // Verify Token
    let token = requestObject.headers.token
      ? requestObject.headers.token
      : false
    tokenVerifier(token, phone, (verified) => {
      if (verified) {
        // Lookup the user
        db.read('users', phone, (err, data) => {
          if (!err && data) {
            let user = jsonStringToObject(data)
            user.firstName = firstName ? firstName : user.firstName
            user.lastName = lastName ? lastName : user.lastName
            user.password = password ? makeHash(password) : user.password
            db.update('users', phone, user, (err) => {
              if (!err) {
                callback(200, { message: 'User Updated Successfully' })
              } else {
                callback(500, { error: 'Failed To Update User' })
              }
            })
          } else {
            callback(404, { error: 'Requested User Not Found' })
          }
        })
      } else {
        callback(403, { error: 'Authentication Failed' })
      }
    })
  } else {
    callback(400, { error: 'There was a Problem in your request!' })
  }
}
handlr._check.delete = (requestObject, callback) => {
  let { phone } = requestObject.query
  phone = phone && phone.length === 11 ? phone : false
  if (phone) {
    // Verify Token
    let token = requestObject.headers.token
      ? requestObject.headers.token
      : false
    tokenVerifier(token, phone, (verified) => {
      if (verified) {
        // Look up the user
        db.read('users', phone, (err, data) => {
          if (!err && data) {
            db.delete('users', phone, (err) => {
              if (!err) {
                callback(200, { message: 'User Deleted Successfully' })
              } else {
                callback(500, { error: 'Failed To Delete User' })
              }
            })
          } else {
            callback(404, { error: 'Requested User Not Found' })
          }
        })
      } else {
        callback(403, { error: 'Authentication Failed' })
      }
    })
  } else {
    callback(400, { error: 'Invalid Phone Number' })
  }
}

module.exports = handlr
