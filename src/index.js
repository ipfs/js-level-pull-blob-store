'use strict'

const Level = require('level')
const write = require('pull-write')
const pushable = require('pull-pushable')
const toBuffer = require('typedarray-to-buffer')
const defer = require('pull-defer/sink')
const toWindow = require('pull-window').recent
const pull = require('pull-stream')

module.exports = class LevelBlobStore {
  constructor (dbname) {
    this.path = dbname || `pull-blob-store-${Math.random().toString().slice(2, 10)}`
    this.db = Level(this.path, { valueEncoding: 'binary' })
  }

  write (key, cb) {
    cb = cb || (() => {})
    const d = defer()

    if (!key) {
      cb(new Error('Missing key'))
      return d
    }

    this.remove(key, (err) => {
      if (err) {
        return cb(err)
      }

      d.resolve(pull(
        toWindow(100, 10),
        write(writer, reduce, 100, cb)
      ))

      function writer (data, cb) {
        var buffer = new Buffer(data)
        this.db.put(key, buffer, function (err) {
          if (err) cb(err)
        })
      }

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

        return queue
      }
    })

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
        if (err) return p.end(new Error('Error getting value'))
        // the lines below are wrong, I think not async
        p.push(toBuffer(value))
        p.end()
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
      if (err) return cb(new Error('Error getting value'))
      return cb(null, true)
    })
  }

  remove (key, cb) {
    cb = cb || (() => {})

    if (!key) {
      return cb(new Error('Missing key'))
    }

    this.db.del(key, function (err) {
      if (err) return cb(new Error('Error removing key'))
      return cb(null, true)
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
