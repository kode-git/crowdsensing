var Transform = require('readable-stream').Transform;
var inherits  = require('util').inherits;

var Stream = function (range) {
  Transform.call(this, { objectMode: true });
  if (!Array.isArray(range)) { range = [range]; }
  var from = this._from = range[0];
  var to   = this._to   = range[1];
  if (range.length === 1 && from >= 0) {
    this._transform = this._skipOnly;
    this._skip = this._from;
  }
  if (range.length === 1 && from < 0) {
    this._transform = this._bufferOnly;
    this._flush     = this._flushBuffer;

    this._buffer     = [];
    this._bufferSize = -from;
  }
  if (from >= 0 && to >= 0) {
    this._transform = this._skipAndTruncate;
    this._skip = from;
    this._pass = to - from;
  }
  if (from >= 0 && to < 0) {
    this._transform = this._skipAndBuffer;

    this._skip       = from;
    this._buffer     = [];
    this._bufferSize = -to;
  }
  if (from < 0 && to < 0) {
    this._transform = this._bufferAndTruncate;
    this._flush     = this._flushBuffer;

    this._buffer     = [];
    this._bufferSize = -from;
    this._pass       = -from + to;
  }
};

inherits(Stream, Transform);

Stream.prototype._skipOnly = function(obj, _, done) {
  if (this._skip > 0) {
    this._skip -= 1;
    return done();
  }
  this.push(obj);
  done();
};

Stream.prototype._bufferOnly = function(obj, _, done) {
  this._buffer.push(obj);
  if (this._buffer.length > this._bufferSize) {
    this._buffer.shift();
  }
  done();
};

Stream.prototype._skipAndTruncate = function(obj, _, done) {
  if (this._skip > 0) {
    this._skip -= 1;
    return done();
  }
  if (this._pass > 0) {
    this._pass -= 1;
    this.push(obj);
    return done();
  }
  done();
};

Stream.prototype._skipAndBuffer = function(obj, _, done) {
  if (this._skip > 0) {
    this._skip -= 1;
    return done();
  }
  this._buffer.push(obj);
  if (this._buffer.length > this._bufferSize) {
    this.push(this._buffer.shift());
  }
  done();
};

Stream.prototype._bufferAndTruncate = function(obj, _, done) {
  this._buffer.push(obj);
  if (this._buffer.length > this._bufferSize) {
    this._buffer.shift();
  }
  done();
};

Stream.prototype._flushBuffer = function(done) {
  var pass = this._buffer.length;
  if (typeof this._pass === 'number') { pass = this._pass; }
  for (var i = 0; i < pass; i ++) {
    this.push(this._buffer[i]);
  }
  done();
};

module.exports = function (range) {
  return new Stream(range);
};
