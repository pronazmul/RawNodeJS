/*
 * Title : File System Module
 * Description: READ WRITE UPDATE DELETE DATA FROM FILE SYSTEM
 * Author: Nazmul Huda
 * Date : 189/04/2022
 */

//Dependencies
const fs = require('fs')
const path = require('path')

// Module Scaffolding
const lib = {}

// Base Url
lib.baseUrl = path.join(__dirname, './../.data/')

lib.create = (subdir, filename, data, callback) => {
  //Create new file if not exists `wx` mode comfirms if exists create error
  fs.open(
    lib.baseUrl + subdir + '/' + filename + '.json',
    'wx',
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        //   Write data to file and close it
        fs.writeFile(fileDescriptor, JSON.stringify(data), (err) => {
          if (!err) {
            // Close file
            fs.close(fileDescriptor, (err) => {
              if (!err) {
                callback(false)
              } else {
                callback('Error closing new file')
              }
            })
          } else {
            callback('Error Writing On New File')
          }
        })
      } else {
        callback('Could not create new file, it may already exist')
      }
    }
  )
}

lib.read = (subdir, file, callback) => {
  fs.readFile(
    lib.baseUrl + subdir + '/' + file + '.json',
    'utf8',
    (err, data) => callback(err, data)
  )
}

lib.update = (subdir, file, data, callback) => {
  fs.open(
    lib.baseUrl + subdir + '/' + file + '.json',
    'r+',
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        fs.ftruncate(fileDescriptor, (err) => {
          if (!err) {
            fs.writeFile(fileDescriptor, JSON.stringify(data), (err) => {
              if (!err) {
                fs.close(fileDescriptor, (err) => {
                  if (!err) {
                    callback(false, data)
                  } else {
                    callback('Error Updating, Error closing file', false)
                  }
                })
              } else {
                callback('Error Updating, File Failed to Write', false)
              }
            })
          } else {
            callback('Error Updating, File Does not truncate', false)
          }
        })
      } else {
        callback('Error Updating, File Does not exist', false)
      }
    }
  )
}

lib.delete = (subdir, file, callback) => {
  fs.unlink(lib.baseUrl + subdir + '/' + file + '.json', (err) => {
    if (!err) {
      callback(false)
    } else {
      callback('Error Deleting, File Does not exist')
    }
  })
}

lib.exists = (subdir, file, callback) => {
  fs.access(
    lib.baseUrl + subdir + '/' + file + '.json',
    fs.constants.F_OK,
    (err) => {
      if (err) {
        callback(false)
      } else {
        callback(true)
      }
    }
  )
}

// Module Export
module.exports = lib
