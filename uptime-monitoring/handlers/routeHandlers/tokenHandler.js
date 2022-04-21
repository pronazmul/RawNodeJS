/*
 * Title: Token Handlers.
 * Description: User Auth Token Handlers. CRUD with Auth Token.
 * Author: Nazmul Huda
 * Date: 20/04/2022
 */
// Dependencies

const db = require('../../lib/data')
const {
  makeHash,
  jsonStringToObject,
  randomStringGenerator,
} = require('../../helper/utilities')

// Module Scaffolding
const handlr = {}

handlr.tokenHandler = (requestProperties, callback) => {
  const allwedMethods = ['get', 'post', 'put', 'delete']
  if (allwedMethods.includes(requestProperties.method)) {
    handlr._token[requestProperties.method](requestProperties, callback)
  } else {
    callback(405, {
      message: 'Your requested not allowed!',
    })
  }
}

handlr._token = {}

handlr._token.get = (requestObject, callback) => {
  let { id } = requestObject.query
  id = id && id.length === 20 ? id : false
  if (id) {
    db.read('tokens', id, (err, data) => {
      if (!err && data) {
        let token = jsonStringToObject(data)
        callback(200, token)
      } else {
        callback(404, { error: 'Requested Token Not Found' })
      }
    })
  } else {
    callback(400, { error: 'Invalid Token ID' })
  }
}

handlr._token.post = (requestObject, callback) => {
  let { phone, password } = requestObject.body
  phone = phone && phone.length === 11 ? phone : false
  password = password ? password.trim() : false
  if (phone && password) {
    db.read('users', phone, (err, data) => {
      if (!err && data) {
        password = makeHash(password)
        let user = jsonStringToObject(data)
        if (user.password === password) {
          let tokenId = randomStringGenerator(20)
          let expires = Date.now() + 1000 * 60 * 60
          let tokenObject = {
            phone,
            tokenId,
            expires,
          }
          db.create('tokens', tokenId, tokenObject, (err) => {
            if (!err) {
              callback(200, tokenObject)
            } else {
              callback(500, { error: 'Failed To Create Token' })
            }
          })
        } else {
          callback(401, {
            error: 'Invalid Password',
          })
        }
      } else {
        callback(401, { error: 'Requested User Not Found' })
      }
    })
  } else {
    callback(401, { error: 'Authentication Failed' })
  }
}

handlr._token.put = (requestObject, callback) => {
  let { id, extend } = requestObject.body
  id = id && id.length === 20 ? id : false
  extend = extend && typeof extend === 'boolean' ? extend : false
  if (id && extend) {
    db.read('tokens', id, (err, data) => {
      if (!err && data) {
        let token = jsonStringToObject(data)
        if (token.expires > Date.now()) {
          token.expires = Date.now() + 1000 * 60 * 60
          db.update('tokens', id, token, (err) => {
            if (!err) {
              callback(200, token)
            } else {
              callback(500, { error: 'Failed To Update Token' })
            }
          })
        } else {
          callback(400, { error: 'Token Already Expired' })
        }
      } else {
        callback(404, { error: 'Requested User Not Found' })
      }
    })
  } else {
    callback(400, { error: 'There was a Problem in your request!' })
  }
}

handlr._token.delete = (requestObject, callback) => {
  let { id } = requestObject.query
  id = id && id.length === 20 ? id : false
  if (id) {
    db.read('tokens', id, (err, data) => {
      if (!err && data) {
        db.delete('tokens', id, (err) => {
          if (!err) {
            callback(200, { message: 'Token Deleted Successfully' })
          } else {
            callback(500, { error: 'Failed To Delete Token' })
          }
        })
      } else {
        callback(404, { error: 'Requested Token Not Found' })
      }
    })
  } else {
    callback(400, { error: 'Invalid Token Id!' })
  }
}

handlr.tokenVerifier = (id, phone, callback) => {
  db.read('tokens', id, (err, data) => {
    if (!err && data) {
      let token = jsonStringToObject(data)
      if (token.phone === phone && token.expires > Date.now()) {
        callback(true)
      } else {
        callback(false)
      }
    } else {
      callback(false)
    }
  })
}

module.exports = handlr
