var through = require('through')

function transform (rename) {
  return through(function write (data) {
    data[rename[1]] = data[rename[0]]
    delete data[rename[0]]
    this.queue(data)
  })

}

module.exports = function (items) {
  var out = through()
  var rename = Array.prototype.slice.call(arguments, 1)
  items
    .pipe(transform(rename))
    .pipe(out)
  return out
}
