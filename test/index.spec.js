'use strict'

const testSuite = require('interface-pull-blob-store/lib/tests')
const levelDown = require('leveldown')
const path = require('path')

const LevelBlobStore = require('../src')

testSuite({
  setup (cb) {
    var randomNo = Math.random()
    var p = path.join('../test', randomNo.toString().substr(2))
    cb(null, new LevelBlobStore(p))
  },
  teardown (store, cb) {
    store.db.close(function () {
      levelDown.destroy(store.path, cb)
    })
  }
})
