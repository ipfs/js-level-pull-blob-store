'use strict'

const testSuite = require('interface-pull-blob-store/lib/tests')

const LevelBlobStore = require('../src')
const levelDown = require('leveldown')

testSuite({
  setup (cb) {
    cb(null, new LevelBlobStore('tmplevel'))
  },
  teardown (store, cb) {
    store.db.close(function () {
      levelDown.destroy('tmplevel', function (err) {
        if (err) {
          cb(err)
        } else {
          cb()
        }
      })
    })
  }
})
