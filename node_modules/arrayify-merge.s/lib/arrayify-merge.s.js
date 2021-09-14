var merge = require('map-merge.s');

module.exports = function (options) {
  options = options || {};
  options.trace = options.trace || function () {};
  var trace = makeTrace(options.trace);
  return merge({ trace: trace }, function (first, second, done) {
    options.trace('arrayify-merge:map');
    done(null, [first, second]);
  });
};

function makeTrace(trace) {
  return function (probe, data) {
    probe = 'arrayify-merge:' + probe;
    trace(probe, data);
  };
}
