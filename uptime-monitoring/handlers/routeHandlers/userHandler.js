/*
 * Title: User route Handlers.
 * Description: User All route Hanler
 * Author: Nazmul Huda
 * Date: 18/04/2022
 */
// Dependencies

const db = require('../../lib/data')
const { makeHash, jsonStringToObject } = require('../../helper/utilities')
const { tokenVerifier } = require('./tokenHandler')

// Module Scaffolding
const handlr = {}

handlr.userHandler = (requestProperties, callback) => {
  const allwedMethods = ['get', 'post', 'put', 'delete']
  if (allwedMethods.includes(requestProperties.method)) {
    handlr._user[requestProperties.method](requestProperties, callback)
  } else {
    callback(405, {
      message: 'Your requested not allowed!',
    })
  }
}

handlr._user = {}

handlr._user.get = (requestObject, callback) => {
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
handlr._user.post = (requestObject, callback) => {
  let { firstName, lastName, phone, password, tosAgreement } =
    requestObject.body

  firstName = firstName ? firstName.trim() : false
  lastName = lastName ? lastName.trim() : false
  phone = phone && phone.length === 11 ? phone : false
  password = password ? password.trim() : false
  tosAgreement = tosAgreement ? tosAgreement : false
  if (firstName && lastName && phone && password && tosAgreement) {
    // check this User is Already Exists or not.If not then create new user. If yes then return error {boolean}
    db.exists('users', phone, (err) => {
      if (!err) {
        // Hash the password
        password = makeHash(password)
        if (password) {
          // Create User
          const user = { firstName, lastName, phone, password, tosAgreement }
          // Insert User into DB
          db.create('users', phone, user, (err) => {
            if (!err) {
              callback(201, { message: 'User Created Successfully' })
            } else {
              callback(500, { error: 'Failed To Create User' })
            }
          })
        } else {
          callback(500, { error: 'Failed To Create Hash' })
        }
      } else {
        callback(500, { error: 'User Already Exists' })
      }
    })
  } else {
    callback(400, { error: 'Missing required fields' })
  }
}
handlr._user.put = (requestObject, callback) => {
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
handlr._user.delete = (requestObject, callback) => {
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
