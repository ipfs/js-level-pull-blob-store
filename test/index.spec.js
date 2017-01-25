'use strict'

const testSuite = require('interface-pull-blob-store/lib/tests')
const levelDown = require('leveldown')
const path = require('path')

const LevelBlobStore = require('../src')

testSuite({
  setup (cb) {
    var randomStr = Math.random().toString().substr(2)
    var databasePath = path.join('../test', randomStr)
    cb(null, new LevelBlobStore(databasePath))
  },
  teardown (store, cb) {
    store.db.close(function () {
      levelDown.destroy(store.path, cb)
    })
  }
})
