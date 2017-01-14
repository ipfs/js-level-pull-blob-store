'use strict'

const testSuite = require('interface-pull-blob-store/lib/tests')
const levelDown = require('leveldown')
const path = require('path')
const os = require('os')

const LevelBlobStore = require('../src')

testSuite({
  setup (cb) {
    var random = Math.random()
    var p = path.join(os.tmpdir(), String(process.pid), random.toString().substr(2))
    cb(null, new LevelBlobStore(p))
  },
  teardown (store, cb) {
    store.db.close(function () {
      levelDown.destroy(store.path, cb)
    })
  }
})
