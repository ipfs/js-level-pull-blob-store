'use strict'

const testSuite = require('interface-pull-blob-store/lib/tests')

const LevelBlobStore = require('../src')
const levelDown = require('leveldown')

testSuite({
  setup (cb) {
    cb(null, new LevelBlobStore('test'))
  },
  teardown (store, cb) {
    store.db.close()
    levelDown.destroy(store.path)
    cb()
  }
})
