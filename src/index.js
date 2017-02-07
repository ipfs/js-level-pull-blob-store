'use strict'

const level = require('level')
const write = require('pull-write')
const pushable = require('pull-pushable')
const defer = require('pull-defer/sink')
const toWindow = require('pull-window').recent
const pull = require('pull-stream')
const toBuffer = require('typedarray-to-buffer')

module.exports = class LevelBlobStore {
  constructor (dbname) {
    this.path = dbname
    this.db = level(this.path, { valueEncoding: 'binary' })
  }

  write (key, cb) {
    const db = this.db
    cb = cb || (() => {})

    const d = defer()

    if (!key) {
      cb(new Error('Missing key'))
      return d
    }

    d.resolve(pull(
      toWindow(100, 10),
      write(writer, reduce, 100, cb)
    ))

    function reduce (queue, data) {
      queue = queue || []
      if (!Array.isArray(data)) {
        data = [data]
      }

      data = data.map(ensureBuffer)

      if (!queue.length || last(queue).length > 99) {
        queue.push(Buffer.concat(data))
      } else {
        queue[lastIndex(queue)] = Buffer.concat(
          last(queue).concat(data)
        )
      }

      console.log(queue.toString())
      return queue
    }

    function writer (blobs, cb) {
      var singleBuffer = new Buffer.concat(blobs)
      db.put(key, singleBuffer, cb)
    }

    return d
  }

  read (key) {
    const p = pushable()

    if (!key) {
      p.end(new Error('Missing key'))
      return p
    }

    this.exists(key, (err, exists) => {
      if (err) {
        return p.end(err)
      }

      if (!exists) {
        return p.end(new Error('Not found'))
      }

      this.db.get(key, function (err, value) {
        if (err) {
          p.end()
        } else {
          p.push(toBuffer(value))
          p.end()
        }
      })
    })

    return p
  }

  exists (key, cb) {
    cb = cb || (() => {})

    if (!key) {
      return cb(new Error('Missing key'))
    }

    this.db.get(key, function (err, value) {
      if (err) {
        cb(null, false)
      } else {
        cb(null, true)
      }
    })
  }

  remove (key, cb) {
    const db = this.db
    cb = cb || (() => {})

    if (!key) {
      return cb(new Error('Missing key'))
    }

    db.get(key, function (err, value) {
      if (err) {
        cb()
      } else {
        db.del(key, function (err) {
          if (err) {
            cb(err)
          } else {
            cb()
          }
        })
      }
    })
  }
}

function lastIndex (arr) {
  return arr.length - 1
}

function last (arr) {
  return arr[lastIndex(arr)]
}

function ensureBuffer (data) {
  return Buffer.isBuffer(data) ? data : Buffer.from(data)
}
