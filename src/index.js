'use strict'

module.exports = class LevelBlobStore {
  constructor () {
    //not sure what needs to be in here
    //maybe the stuff to setup the connection to the leveldb store
  }

  write (key, cb) {
    cb = cb || (() => {})

    if (!key) {
      return cb(new Error('Missing key'))
    }
    
  }

  read (key) {
    if (!key) {
      return pull.error(new Error('Missing key'))
    }

    //get the value and return it as a pull
    //return an error if key is not found
  }

  exists (key, cb) {
    cb = cb || (() => {})

    if (!key) {
      return cb(new Error('Missing key'))
    }

    //call the callback and return true/false?
  }

  remove (key, cb) {
    cb = cb || (() => {})

    if (!key) {
      return cb(new Error('Missing key'))
    }

    //delete the key
    //call the callback with status of delete?
  }
}
