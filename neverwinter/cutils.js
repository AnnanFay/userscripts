cutils.forEachSeries = function forEachSeries(array, mod, callback) {
  callback = callback || function () {};

  if (!array.length) {
    return callback();
  }
  var d = 0

  function next(error) {
    if (error) {
      callback(error);
      callback = function () {};
    } else {
      d++;
      if (d === array.length) {
        return cutils.nextTick(callback)
      }

      return e();
    }

  }

  function e() {
    mod(array[d], next);
  };

  e();
}